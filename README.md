# What is this thing?

When working with cargo projects that depend on other cargo projects, you will possibly hit (very confusing) errors if both the projects have common dependencies but at different versions.  

So when working with projects that depend upon safecoin, it simplifies things to normalize the dependencies.  Specifically, in trying to get serum-dex to compile I found that it depends on safecoin-sdk, safecoin-program and safecoin-program-library BUT safecoin-program-library also depends on safecoin-sdk, safecoin-program, et.al.  

This tool looks through all the Cargo.toml files finding dependencies to the various shared crates and normalizes them to use local path refs instead of crate.io version refs. Once normalized, the shared/common crates have a "single version of truth" and cargo build is much happier.

This does not quite do all the work to convert a solana project to safecoin.  You still need to convert solana-client to safecoin-client in the rust code.  Also, the cargo files will work, they are restructured because the code generates "canonical" toml.  Still it beats finding and editting by hand all the cargo files in a big project.

# Usage
```
cargoref.sh [-m] <directory>
```
`<directory>` : where to recursively look for (and modify) Cargo.toml files

## Option
`-m` : Map solana crates to safecoin crates.  For example, convert from spl-token refs to safe-token refs. 