use std::collections::BTreeMap;

use proc_macro_rules::rules;
use quote::ToTokens;
use syn::{
    parse::{Parse, ParseStream},
    AttrStyle, Attribute, FnArg, GenericParam, Generics, Ident, Pat, ReturnType, Signature, Type,
    TypeParamBound, TypePath,
};
use thiserror::Error;

use crate::function::MacroFunctionError;

#[derive(Error, Debug)]
pub enum ArgError {
    #[error("Invalid self argument")]
    InvalidSelf,
    #[error("Invalid argument type: {0} ({1})")]
    InvalidType(String, &'static str),
    #[error("The type {0} cannot be a reference")]
    InvalidReference(String),
    #[error("The type {0} must be a reference")]
    MissingReference(String),
    #[error("Internal error: {0}")]
    InternalError(String),
    #[error("The type '{0}' is not allowed in this position")]
    NotAllowedInThisPosition(String),
    #[error("Missing a #[{0}] attribute for type: {1}")]
    MissingAttribute(&'static str, String),
    #[error("Invalid #[{0}] for type: {1}")]
    InvalidAttributeType(&'static str, String),
    #[error("Argument attribute error")]
    AttributeError(#[from] AttributeError),
    #[error("Invalid argument type path: {0}")]
    InvalidTypePath(String),
}

#[derive(Error, Debug)]
pub enum ReturnError {
    #[error("Invalid return type: {0}")]
    InvalidType(#[from] ArgError),
    #[error("Invalid return type: {0} ({1})")]
    InvalidReturnType(String, &'static str),
    #[error("Return value attribute error")]
    AttributeError(#[from] AttributeError),
}

#[derive(Error, Debug)]
pub enum SignatureError {
    #[error("Invalid return type: {0}")]
    ReturnError(#[from] ReturnError),
    #[error("Only one lifetime is permitted")]
    TooManyLifetimes,
    #[error("Generic '{0}' must have one and only bound (either <T> and 'where T: Trait', or <T: Trait>)")]
    GenericBoundCardinality(String),
    #[error(
        "Where clause predicate '{0}' (eg: where T: Trait) must appear in generics list (eg: <T>)"
    )]
    WherePredicateMustAppearInGenerics(String),
    #[error("All generics must appear only once in the generics parameter list or where clause")]
    DuplicateGeneric(String),
    #[error("Generic lifetime '{0}' may not have bounds (eg: <'a: 'b>)")]
    LifetimesMayNotHaveBounds(String),
    #[error("Invalid generic: '{0}' Only simple generics bounds are allowed (eg: T: Trait)")]
    InvalidGeneric(String),
    #[error("Invalid predicate: '{0}' Only simple where predicates are allowed (eg: T: Trait)")]
    InvalidWherePredicate(String),
    #[error("Invalid metadata attribute: {0}")]
    InvalidMetaAttribute(#[source] syn::Error),
}

enum UnwrappedReturn {
    Type(Type),
    Result(Type),
    Future(Type),
}

#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum RefType {
    Ref,
    Mut,
}

#[derive(Copy, Clone, PartialEq, Eq)]
pub enum Position {
    Arg,
    ReturnValue,
}

#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Strings {
    String,
    CowStr,
    RefStr,
    CowByte,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Arg {
    String(Strings),
    OptionString(Strings),
    Void,
    Special(Special),
    Option(Special),
    Function,
    OptionFunction,
    Number(NumberType),
    OptionNumber(NumberType),
}

#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum NumberType {
    I32,
}

impl Arg {
    fn from_parsed(parsed: ParsedTypeContainer, _: Attributes) -> Result<Self, ArgError> {
        use ParsedType::*;
        use ParsedTypeContainer::*;

        match parsed {
            CBare(TString(string)) => Ok(Arg::String(string)),
            COption(TString(string)) => Ok(Arg::OptionString(string)),
            CBare(TSpecial(special)) => Ok(Arg::Special(special)),
            COption(TSpecial(special)) => Ok(Arg::Option(special)),
            CBare(TFunction) => Ok(Arg::Function),
            COption(TFunction) => Ok(Arg::OptionFunction),
            CBare(TNumber(typ)) => Ok(Arg::Number(typ)),
            COption(TNumber(typ)) => Ok(Arg::OptionNumber(typ)),
            _ => unreachable!(),
        }
    }
}

#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum StringMode {
    Default,
    OneByte,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Special {
    Context,
    JsValue,
}

#[derive(Debug)]
pub enum ParsedType {
    TString(Strings),
    TSpecial(Special),
    TFunction,
    TNumber(NumberType),
}

impl ParsedType {
    fn required_attributes(&self, position: Position) -> Option<&'static [AttributeModifier]> {
        use ParsedType::*;
        match self {
            TString(Strings::CowByte) => Some(&[AttributeModifier::String(StringMode::OneByte)]),
            TString(..) => Some(&[AttributeModifier::String(StringMode::Default)]),
            TFunction => match position {
                Position::Arg => Some(&[AttributeModifier::Function]),
                _ => None,
            },
            TNumber(..) => Some(&[AttributeModifier::Number(NumberType::I32)]),
            _ => None,
        }
    }
}

pub(crate) fn stringify_token(tokens: impl ToTokens) -> String {
    tokens
        .into_token_stream()
        .into_iter()
        .map(|s| s.to_string())
        .collect::<Vec<_>>()
        .join("")
        .replace(" , ", ", ")
}

#[derive(Debug)]
pub enum ParsedTypeContainer {
    CBare(ParsedType),
    COption(ParsedType),
    CRc(ParsedType),
    CRcRefCell(ParsedType),
}

#[derive(Copy, Clone, Default)]
pub(crate) struct Attributes {
    primary: Option<AttributeModifier>,
}

impl ParsedTypeContainer {
    pub fn required_attributes(&self, position: Position) -> Option<&'static [AttributeModifier]> {
        use ParsedTypeContainer::*;
        match self {
            CBare(t) | COption(t) | CRcRefCell(t) | CRc(t) => t.required_attributes(position),
        }
    }

    fn validate_attributes(
        &self,
        position: Position,
        attrs: Attributes,
        tp: &impl ToTokens,
    ) -> Result<(), ArgError> {
        match self.required_attributes(position) {
            None => match attrs.primary {
                None => {}
                Some(attr) => {
                    return Err(ArgError::InvalidAttributeType(
                        attr.name(),
                        stringify_token(tp),
                    ));
                }
            },
            Some(attr) => {
                if attr.is_empty() {
                    return Err(ArgError::NotAllowedInThisPosition(stringify_token(tp)));
                }
                match attrs.primary {
                    None => {
                        return Err(ArgError::MissingAttribute(
                            attr[0].name(),
                            stringify_token(tp),
                        ))
                    }
                    Some(primary) => {
                        if !attr.contains(&primary) {
                            return Err(ArgError::MissingAttribute(
                                attr[0].name(),
                                stringify_token(tp),
                            ));
                        }
                    }
                }
            }
        };
        Ok(())
    }
}

#[derive(Copy, Clone, Eq, PartialEq)]
enum TypePathContext {
    None,
    Ref,
    Ptr,
}

fn parse_type_special(
    position: Position,
    attrs: Attributes,
    ty: &Type,
) -> Result<Special, ArgError> {
    match parse_type(position, attrs, ty)? {
        Arg::Special(special) => Ok(special),
        _ => Err(ArgError::InvalidType(
            stringify_token(ty),
            "for special type",
        )),
    }
}

fn parse_type_path(
    position: Position,
    attrs: Attributes,
    ctx: TypePathContext,
    tp: &TypePath,
) -> Result<ParsedTypeContainer, ArgError> {
    use ParsedType::*;
    use ParsedTypeContainer::*;

    let tokens = tp.clone().into_token_stream();
    /** if let Ok(numeric) = parse_numeric_type(&tp.path) {
        CBare(TNumeric(numeric))
    } else **/
    let res = {
        std::panic::catch_unwind(|| {
      rules!(tokens => {
        ( $( std :: str  :: )? String ) => {
          Ok(CBare(TString(Strings::String)))
        }
        ( $( std :: str :: )? str ) => {
          Ok(CBare(TString(Strings::RefStr)))
        }
        ( $( std :: borrow :: )? Cow < $( $_lt:lifetime , )? str $(,)? > ) => {
          Ok(CBare(TString(Strings::CowStr)))
        }
        ( $( std :: borrow :: )? Cow < $( $_lt:lifetime , )? [ u8 ] $(,)? > ) => {
          Ok(CBare(TString(Strings::CowByte)))
        }
        ( boa_engine::Context ) => Ok(CBare(TSpecial(Special::Context))),
        ( $( std :: rc :: )? Rc < RefCell < $ty:ty $(,)? > $(,)? > ) => Ok(CRcRefCell(TSpecial(parse_type_special(position, attrs, &ty)?))),
        ( $( std :: rc :: )? Rc < $ty:ty $(,)? > ) => Ok(CRc(TSpecial(parse_type_special(position, attrs, &ty)?))),
        ( Option < $ty:ty $(,)? > ) => {
          match parse_type(position, attrs, &ty)? {
            Arg::String(string) => Ok(COption(TString(string))),
            Arg::Function => Ok(COption(TFunction)),
            Arg::Number(typ) => Ok(COption(TNumber(typ))),
            _ => Err(ArgError::InvalidType(stringify_token(ty), "for option"))
          }
        }
        ( i32 ) => Ok(CBare(TNumber(NumberType::I32))),
        ( Option < i32 $(,)? > ) => Ok(COption(TNumber(NumberType::I32))),
        ( JsValue ) => Ok(CBare(TSpecial(Special::JsValue))),
        ( JsFunction ) => Ok(CBare(TFunction)),
        ( $any:ty ) => {
          Err(ArgError::InvalidTypePath(stringify_token(any)))
        }
      })
    }).map_err(|e| ArgError::InternalError(format!("parse_type_path {e:?}")))??
    };

    match res {
        CBare(TSpecial(Special::Context)) => {}
        CBare(TString(Strings::RefStr)) => {
            if ctx != TypePathContext::Ref {
                return Err(ArgError::MissingReference(stringify_token(tp)));
            }
        }
        _ => {
            if ctx == TypePathContext::Ref {
                return Err(ArgError::InvalidReference(stringify_token(tp)));
            }
        }
    }

    if ctx != TypePathContext::Ptr {
        res.validate_attributes(position, attrs, &tp)?;
    }

    Ok(res)
}

pub(crate) fn parse_type(
    position: Position,
    attrs: Attributes,
    ty: &Type,
) -> Result<Arg, ArgError> {
    use ParsedType::*;
    use ParsedTypeContainer::*;

    if let Some(primary) = attrs.primary {
        match primary {
            _ => {}
        }
    };
    match ty {
        Type::Tuple(of) => {
            if of.elems.is_empty() {
                Ok(Arg::Void)
            } else {
                Err(ArgError::InvalidType(stringify_token(ty), "for tuple"))
            }
        }
        Type::Reference(of) => match &*of.elem {
            Type::Path(of) => match parse_type_path(position, attrs, TypePathContext::Ref, of)? {
                CBare(TString(Strings::RefStr)) => Ok(Arg::String(Strings::RefStr)),
                COption(TString(Strings::RefStr)) => Ok(Arg::OptionString(Strings::RefStr)),
                CBare(TString(Strings::String)) => Ok(Arg::String(Strings::String)),
                COption(TString(Strings::String)) => Ok(Arg::OptionString(Strings::String)),
                CBare(TString(Strings::CowStr)) => Ok(Arg::String(Strings::CowStr)),
                COption(TString(Strings::CowStr)) => Ok(Arg::OptionString(Strings::CowStr)),
                CBare(TString(Strings::CowByte)) => Ok(Arg::String(Strings::CowByte)),
                COption(TString(Strings::CowByte)) => Ok(Arg::OptionString(Strings::CowByte)),
                CBare(TSpecial(Special::Context)) => Ok(Arg::Special(Special::Context)),
                CBare(TSpecial(Special::JsValue)) => Ok(Arg::Special(Special::JsValue)),
                CBare(TFunction) => Ok(Arg::Function),
                COption(TFunction) => Ok(Arg::OptionFunction),

                _ => Err(ArgError::InvalidType(
                    stringify_token(ty),
                    "for reference path",
                )),
            },
            _ => Err(ArgError::InvalidType(stringify_token(ty), "for reference")),
        },
        Type::Path(of) => Arg::from_parsed(
            parse_type_path(position, attrs, TypePathContext::None, of)?,
            attrs,
        )
        .map_err(|_| ArgError::InvalidType(stringify_token(ty), "for path")),
        _ => Err(ArgError::InvalidType(
            stringify_token(ty),
            "for top-level type",
        )),
    }
}

#[derive(Error, Debug)]
pub enum AttributeError {
    #[error("Unknown or invalid attribute '{0}'")]
    InvalidAttribute(String),
    #[error("Invalid inner attribute (#![attr]) in this position. Use an equivalent outer attribute (#[attr]) on the function instead.")]
    InvalidInnerAttribute,
    #[error("Too many attributes")]
    TooManyAttributes,
}

fn parse_attributes(attributes: &[Attribute]) -> Result<Attributes, AttributeError> {
    let mut attrs = vec![];
    for attr in attributes {
        if let Some(attr) = parse_attribute(attr)? {
            attrs.push(attr)
        }
    }

    if attrs.is_empty() {
        return Ok(Attributes::default());
    }
    if attrs.len() > 1 {
        return Err(AttributeError::TooManyAttributes);
    }
    Ok(Attributes {
        primary: Some(*attrs.first().unwrap()),
    })
}

#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum AttributeModifier {
    String(StringMode),
    Function,
    Number(NumberType),
}

impl AttributeModifier {
    fn name(&self) -> &'static str {
        match self {
            AttributeModifier::String(_) => "string",
            AttributeModifier::Function => "function",
            AttributeModifier::Number(typ) => match typ {
                NumberType::I32 => "i32",
            },
        }
    }
}

fn parse_attribute(attr: &Attribute) -> Result<Option<AttributeModifier>, AttributeError> {
    let tokens = attr.into_token_stream();
    let res = std::panic::catch_unwind(|| {
        rules!(tokens => {
            (#[string]) => Some(AttributeModifier::String(StringMode::Default)),
            (#[string(onebyte)]) => Some(AttributeModifier::String(StringMode::OneByte)),
            (#[function]) => Some(AttributeModifier::Function),
            (#[i32]) => Some(AttributeModifier::Number(NumberType::I32)),

            // Other
            (#[allow ($_rule:path)]) => None,
            (#[doc = $_attr:literal]) => None,
            (#[cfg $_cfg:tt]) => None,
            (#[meta ($($_key: ident = $_value: literal),*)]) => None,
        })
    })
    .map_err(|_| AttributeError::InvalidAttribute(stringify_token(attr)))?;
    Ok(res)
}

fn parse_arg(arg: FnArg) -> Result<Arg, ArgError> {
    let FnArg::Typed(typed) = arg else {
        return Err(ArgError::InvalidSelf);
    };
    parse_type(Position::Arg, parse_attributes(&typed.attrs)?, &typed.ty)
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ReturnValue {
    Infallible(Arg),
    Result(Arg),
    Future(Arg),
    FutureResult(Arg),
    ResultFuture(Arg),
    ResultFutureResult(Arg),
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ParsedSignature {
    pub args: Vec<Arg>,
    pub names: Vec<String>,
    pub ret_val: ReturnValue,
    pub lifetime: Option<String>,
    pub generic_bounds: BTreeMap<String, String>,
    pub metadata: BTreeMap<Ident, syn::Lit>,
}

fn unwrap_return(ty: &Type) -> Result<UnwrappedReturn, ReturnError> {
    match ty {
        Type::ImplTrait(imp) => {
            if imp.bounds.len() != 1 {
                return Err(ReturnError::InvalidType(ArgError::InvalidType(
                    stringify_token(ty),
                    "for impl trait bounds",
                )));
            }
            if let Some(TypeParamBound::Trait(t)) = imp.bounds.first() {
                rules!(t.into_token_stream() => {
                  ($($_package:ident ::)* Future < Output = $ty:ty $(,)? >) => Ok(UnwrappedReturn::Future(ty)),
                  ($ty:ty) => Err(ReturnError::InvalidType(ArgError::InvalidType(stringify_token(ty), "for impl Future"))),
                })
            } else {
                Err(ReturnError::InvalidType(ArgError::InvalidType(
                    stringify_token(ty),
                    "for impl",
                )))
            }
        }
        Type::Path(ty) => {
            rules!(ty.to_token_stream() => {
              ($($_package:ident ::)* Result < $ty:ty $(,)? >) => {
                Ok(UnwrappedReturn::Result(ty))
              }
              ($($_package:ident ::)* Result < $ty:ty, $_error:ty $(,)? >) => {
                Ok(UnwrappedReturn::Result(ty))
              }
              ($ty:ty) => {
                Ok(UnwrappedReturn::Type(ty))
              }
            })
        }
        Type::Tuple(_) => Ok(UnwrappedReturn::Type(ty.clone())),
        Type::Ptr(_) => Ok(UnwrappedReturn::Type(ty.clone())),
        Type::Reference(_) => Ok(UnwrappedReturn::Type(ty.clone())),
        _ => Err(ReturnError::InvalidType(ArgError::InvalidType(
            stringify_token(ty),
            "for return type",
        ))),
    }
}

pub(crate) fn parse_return(
    is_async: bool,
    attrs: Attributes,
    rt: &ReturnType,
) -> Result<ReturnValue, ReturnError> {
    use UnwrappedReturn::*;

    let res = match rt {
        ReturnType::Default => ReturnValue::Infallible(Arg::Void),
        ReturnType::Type(_, rt) => match unwrap_return(rt)? {
            Type(ty) => ReturnValue::Infallible(parse_type(Position::ReturnValue, attrs, &ty)?),
            Result(ty) => match unwrap_return(&ty)? {
                Type(ty) => ReturnValue::Result(parse_type(Position::ReturnValue, attrs, &ty)?),
                Future(ty) => match unwrap_return(&ty)? {
                    Type(ty) => {
                        ReturnValue::ResultFuture(parse_type(Position::ReturnValue, attrs, &ty)?)
                    }
                    Result(ty) => ReturnValue::ResultFutureResult(parse_type(
                        Position::ReturnValue,
                        attrs,
                        &ty,
                    )?),
                    _ => {
                        return Err(ReturnError::InvalidReturnType(
                            stringify_token(rt),
                            "for result of future",
                        ))
                    }
                },
                _ => {
                    return Err(ReturnError::InvalidReturnType(
                        stringify_token(rt),
                        "for result",
                    ))
                }
            },
            Future(ty) => match unwrap_return(&ty)? {
                Type(ty) => ReturnValue::Future(parse_type(Position::ReturnValue, attrs, &ty)?),
                Result(ty) => {
                    ReturnValue::FutureResult(parse_type(Position::ReturnValue, attrs, &ty)?)
                }
                _ => {
                    return Err(ReturnError::InvalidReturnType(
                        stringify_token(rt),
                        "for future",
                    ))
                }
            },
        },
    };

    if is_async {
        let res = match res {
            ReturnValue::Infallible(t) => ReturnValue::Future(t),
            ReturnValue::Result(t) => ReturnValue::FutureResult(t),
            _ => {
                return Err(ReturnError::InvalidReturnType(
                    stringify_token(rt),
                    "for async return",
                ))
            }
        };
        Ok(res)
    } else {
        Ok(res)
    }
}

fn parse_lifetime(generics: &Generics) -> Result<Option<String>, SignatureError> {
    let mut res = None;
    for param in &generics.params {
        if let GenericParam::Lifetime(lt) = param {
            if !lt.bounds.is_empty() {
                return Err(SignatureError::LifetimesMayNotHaveBounds(
                    lt.lifetime.to_string(),
                ));
            }
            if res.is_some() {
                return Err(SignatureError::TooManyLifetimes);
            }
            res = Some(lt.lifetime.ident.to_string());
        }
    }
    Ok(res)
}

fn parse_bound(bound: &Type) -> Result<String, SignatureError> {
    let error = || {
        Err(SignatureError::InvalidWherePredicate(stringify_token(
            bound,
        )))
    };

    Ok(match bound {
        Type::TraitObject(t) => {
            let mut has_static_lifetime = false;
            let mut bound = None;
            for b in &t.bounds {
                match b {
                    TypeParamBound::Lifetime(lt) => {
                        if lt.ident != "static" || has_static_lifetime {
                            return error();
                        }
                        has_static_lifetime = true;
                    }
                    TypeParamBound::Trait(t) => {
                        if bound.is_some() {
                            return error();
                        }
                        bound = Some(stringify_token(t));
                    }
                    _ => return error(),
                }
            }
            let Some(bound) = bound else {
                return error();
            };
            if has_static_lifetime {
                format!("{bound} + 'static")
            } else {
                bound
            }
        }
        Type::Path(p) => stringify_token(p),
        _ => {
            return error();
        }
    })
}

fn parse_generics(generics: &Generics) -> Result<BTreeMap<String, String>, SignatureError> {
    let mut where_clauses = BTreeMap::new();

    if let Some(where_clause) = &generics.where_clause {
        for predicate in &where_clause.predicates {
            let predicate = predicate.to_token_stream();
            let (generic_name, bound) = std::panic::catch_unwind(|| {
                rules!(predicate => {
                  ($t:ident : $bound:ty) => (t.to_string(), bound),
                })
            })
            .map_err(|_| SignatureError::InvalidWherePredicate(predicate.to_string()))?;
            let bound = parse_bound(&bound)?;
            if where_clauses.insert(generic_name.clone(), bound).is_some() {
                return Err(SignatureError::DuplicateGeneric(generic_name));
            }
        }
    }

    let mut res = BTreeMap::new();
    for param in &generics.params {
        if let GenericParam::Type(ty) = param {
            let ty = ty.to_token_stream();
            let (name, bound) = std::panic::catch_unwind(|| {
                rules!(ty => {
                  ($t:ident : $bound:ty) => (t.to_string(), Some(bound)),
                  ($t:ident) => (t.to_string(), None),
                })
            })
            .map_err(|_| SignatureError::InvalidGeneric(ty.to_string()))?;
            let bound = match bound {
                Some(bound) => {
                    if where_clauses.contains_key(&name) {
                        return Err(SignatureError::GenericBoundCardinality(name));
                    }
                    parse_bound(&bound)?
                }
                None => {
                    let Some(bound) = where_clauses.remove(&name) else {
                        return Err(SignatureError::GenericBoundCardinality(name));
                    };
                    bound
                }
            };
            if res.contains_key(&name) {
                return Err(SignatureError::DuplicateGeneric(name));
            }
            res.insert(name, bound);
        }
    }
    if !where_clauses.is_empty() {
        return Err(SignatureError::WherePredicateMustAppearInGenerics(
            where_clauses.into_keys().next().unwrap(),
        ));
    }

    Ok(res)
}

struct MetadataPair {
    key: Ident,
    _eq: syn::Token![=],
    value: syn::Lit,
}

impl Parse for MetadataPair {
    fn parse(input: ParseStream) -> syn::Result<Self> {
        Ok(Self {
            key: input.parse()?,
            _eq: input.parse()?,
            value: input.parse()?,
        })
    }
}

impl Parse for MetadataPairs {
    fn parse(input: ParseStream) -> syn::Result<Self> {
        let pairs = input.parse_terminated(MetadataPair::parse, syn::Token![,])?;
        Ok(Self { pairs })
    }
}

struct MetadataPairs {
    pairs: syn::punctuated::Punctuated<MetadataPair, syn::Token![,]>,
}

fn parse_metadata_pairs(attr: &Attribute) -> Result<Vec<(Ident, syn::Lit)>, SignatureError> {
    let syn::Meta::List(meta) = &attr.meta else {
        return Ok(vec![]);
    };
    if !meta.path.is_ident("meta") {
        return Ok(vec![]);
    }

    let pairs = meta
        .parse_args_with(MetadataPairs::parse)
        .map_err(SignatureError::InvalidMetaAttribute)?;
    Ok(pairs
        .pairs
        .into_iter()
        .map(|pair| (pair.key, pair.value))
        .collect())
}

fn parse_metadata(attributes: &[Attribute]) -> Result<BTreeMap<Ident, syn::Lit>, SignatureError> {
    let mut metadata = BTreeMap::new();
    for attr in attributes {
        let pairs = parse_metadata_pairs(attr)?;
        metadata.extend(pairs);
    }
    Ok(metadata)
}

pub fn parse_signature(
    attributes: Vec<Attribute>,
    sig: Signature,
) -> Result<ParsedSignature, SignatureError> {
    let mut args: Vec<Arg> = vec![];
    let mut names: Vec<String> = vec![];

    for input in sig.inputs.iter() {
        let name = match &input {
            FnArg::Receiver(_) => continue,
            FnArg::Typed(ty) => match &*ty.pat {
                Pat::Ident(ident) => ident.ident.to_string(),
                _ => "(complex)".to_owned(),
            },
        };
        names.push(name.clone());
        args.push(
            parse_arg(input.clone())
                .map_err(|err| MacroFunctionError::InvalidArgument(name, err))
                .unwrap(),
        );
    }

    let ret_val = parse_return(
        sig.asyncness.is_some(),
        parse_attributes(&attributes).map_err(ReturnError::AttributeError)?,
        &sig.output,
    )?;
    let lifetime = parse_lifetime(&sig.generics)?;
    let generic_bounds = parse_generics(&sig.generics)?;
    let metadata = parse_metadata(&attributes)?;

    Ok(ParsedSignature {
        names,
        args,
        ret_val,
        generic_bounds,
        lifetime,
        metadata,
    })
}
