package main

import (
	"fmt"

	"aidanwoods.dev/go-paseto"
)

func main() {
	sk := paseto.NewV4AsymmetricSecretKey()
	pk := sk.Public()
	fmt.Println(pk != paseto.V4AsymmetricPublicKey{})
}
