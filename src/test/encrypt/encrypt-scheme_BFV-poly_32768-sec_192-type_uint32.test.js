describe('encrypt on BFV', () => {
  describe('polyModulusDegree 32768', () => {
    test('192-bit security', async () => {
      const { Seal } = require('../../index.js')
      const Morfix = await Seal
      const parms = Morfix.EncryptionParameters({
        schemeType: Morfix.SchemeType.BFV
      })

      parms.setPolyModulusDegree({
        polyModulusDegree: 32768
      })
        
      // Create a suitable vector of CoeffModulus primes
      parms.setCoeffModulus({
        coeffModulus: Morfix.CoeffModulus.Create({
          polyModulusDegree: 32768,
          bitSizes: Morfix.Vector({array: new Int32Array([54,54,54,54,54,55,55,55,55,55,55]) }),
          securityLevel: Morfix.SecurityLevel.tc192
        })
      })
      
      // Set the PlainModulus to a prime of bitSize 20.
      parms.setPlainModulus({
        plainModulus: Morfix.PlainModulus.Batching({
          polyModulusDegree: 32768,
          bitSize: 20
        })
      })
      
      const context = Morfix.Context({
        encryptionParams: parms,
        expandModChain: true,
        securityLevel: Morfix.SecurityLevel.tc192
      })

      expect(context.parametersSet).toBe(true)

      const encoder = Morfix.BatchEncoder({
        context: context
      })

      const keyGenerator = Morfix.KeyGenerator({
        context: context
      })

      const publicKey = keyGenerator.getPublicKey()
      const secretKey = keyGenerator.getSecretKey()
      const encryptor = Morfix.Encryptor({
        context: context,
        publicKey: publicKey
      })
      const decryptor = Morfix.Decryptor({
        context: context,
        secretKey: secretKey
      })
      
      // Create data to be encrypted
      const array = Uint32Array.from({
        length: 32768
      }).map((x, i) =>  i)
      
      // Convert data to a c++ 'vector'
      const vector = Morfix.Vector({array})

      // Create a plainText variable and encode the vector to it
      const plainText = Morfix.PlainText()
      
      encoder.encodeVectorUInt32({
        vector: vector,
        plainText: plainText
      })
      
      // Create a cipherText variable and encrypt the plainText to it
      const cipherText = Morfix.CipherText()
      encryptor.encrypt({
        plainText: plainText,
        cipherText: cipherText
      })

      // Create a new plainText variable to store the decrypted cipherText
      const decryptedPlainText = Morfix.PlainText()
      decryptor.decrypt({
        cipherText: cipherText,
        plainText: decryptedPlainText
      })

      // Create a c++ vector to store the decoded result
      const decodeVector = Morfix.Vector({array: new Uint32Array() })

      // Decode the plaintext to the c++ vector
      encoder.decodeVectorUInt32({
        plainText: decryptedPlainText,
        vector: decodeVector
      })

      // Convert the vector to a JS array
      const decryptedArray = decodeVector.toArray()

      expect(decryptedArray).toBeInstanceOf(Uint32Array)
      // Check values
      expect(decryptedArray).toEqual(array)
    })
  })
})