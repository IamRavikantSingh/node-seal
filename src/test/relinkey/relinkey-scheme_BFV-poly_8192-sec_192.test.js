describe('relinkey on BFV', () => {
  describe('polyModulusDegree 8192', () => {
    test('192-bit security', async () => {
      const { Seal } = require('../../index.js')
      const Morfix = await Seal
      const schemeType = Morfix.SchemeType.BFV
      const securityLevel = Morfix.SecurityLevel.tc192
      const polyModulusDegree = 8192
      const bitSizes = [38,38,38,38]
      const bitSize = 20

      const parms = Morfix.EncryptionParameters(schemeType)

      parms.setPolyModulusDegree(polyModulusDegree)

      // Create a suitable set of CoeffModulus primes
      parms.setCoeffModulus(
        Morfix.CoeffModulus.Create(polyModulusDegree, Int32Array.from(bitSizes))
      )

      // Set the PlainModulus to a prime of bitSize 20.
      parms.setPlainModulus(
        Morfix.PlainModulus.Batching(polyModulusDegree, bitSize)
      )

      const context = Morfix.Context(
        parms,
        true,
        securityLevel
      )

      expect(context.parametersSet).toBe(true)

      const keyGenerator = Morfix.KeyGenerator(context)

      const spyGenRelinKeys = jest.spyOn(keyGenerator, 'genRelinKeys')
      const relinKeys = keyGenerator.genRelinKeys()
      expect(spyGenRelinKeys).toHaveBeenCalled()

      const spySaveRelinKeys = jest.spyOn(relinKeys, 'save')
      const base64 = relinKeys.save()
      expect(spySaveRelinKeys).toHaveBeenCalled()

      const spyLoadRelinKeys = jest.spyOn(relinKeys, 'load')
      relinKeys.load(context, base64)
      expect(spyLoadRelinKeys).toHaveBeenCalled()
    })
  })
})
