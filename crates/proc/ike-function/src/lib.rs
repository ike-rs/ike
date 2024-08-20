use function::macro_function;
use proc_macro::TokenStream;

mod function;
mod parse;

#[doc = "This is proc macro for generating boa.rs function. This code is adapted from Deno."]
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
