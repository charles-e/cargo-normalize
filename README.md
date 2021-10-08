# What is this thing?

When working with cargo projects that depend on other cargo projects, you will possibly hit (very confusing) errors if both the projects have common dependencies but at different versions.  

So when working with projects that depend upon safecoin, it simplifies things to normalize the dependencies.  Specifically, in trying to get serum-dex to compile I found that it depends on safecoin-sdk, safecoin-program and safecoin-program-library BUT safecoin-program-library also depends on safecoin-sdk, safecoin-program, et.al.  

This tool looks through all the Cargo.toml files finding dependencies to the various shared crates and normalizes them to use local path refs instead of crate.io version refs. Once normalized, the shared/common crates have a "single version of truth" and cargo build is much happier.
