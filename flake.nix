{
  description = "Ansible environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          config = { allowUnfree = true; };
          system = system;
        };

      in with pkgs; rec {

        devShell = pkgs.mkShell rec { buildInputs = with pkgs; [ nodejs jq ]; };
      });
}
