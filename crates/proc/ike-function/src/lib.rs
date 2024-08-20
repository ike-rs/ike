use function::macro_function;
use proc_macro::TokenStream;

mod function;
mod parse;

#[doc = include_str!("../README.md")]
#[proc_macro_attribute]
pub fn ike_function(attr: TokenStream, item: TokenStream) -> TokenStream {
    match macro_function(attr.into(), item.into()) {
        Ok(tokens) => tokens.into(),
        Err(err) => {
            let error = err.to_string();
            TokenStream::from(quote::quote! {
                compile_error!(#error);
            })
        }
    }
}
