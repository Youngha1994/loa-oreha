import { SetMaterialCosts, CraftingMaterial, OrehaFusionMaterial, CalculateBestOreha} from '../components/calculations.js';

let MATERIAL_COSTS = {}
describe('calculateBestOreha', () => {
    it('returns "Basic Oreha" when crafting Basic Orehas is most profitable', () => {
        MATERIAL_COSTS= {
            basicOreha:     1000,
            superiorOreha:  22,
            primeOreha:     47,
            fish:           40,
            redfleshFish:   8,
            naturalPearl:   9,
            orehaCarp:      49,
            ancientRelic:   41,
            rareRelic:      9,
            orehaRelic:     57
        };
        expect(CalculateBestOreha(MATERIAL_COSTS).id).toBe("basicOreha");
    });

    it('returns "Superior Oreha" when crafting Superior Orehas is most profitable', () => {
        MATERIAL_COSTS= {
            basicOreha:     11,
            superiorOreha:  1000,
            primeOreha:     47,
            fish:           40,
            redfleshFish:   8,
            naturalPearl:   9,
            orehaCarp:      49,
            ancientRelic:   41,
            rareRelic:      9,
            orehaRelic:     57
        };
        expect(CalculateBestOreha(MATERIAL_COSTS).id).toBe("superiorOreha");
    });

    it('returns "Prime Oreha" when crafting Prime Orehas is most profitable', () => {
        MATERIAL_COSTS= {
            basicOreha:     11,
            superiorOreha:  22,
            primeOreha:     1000,
            fish:           40,
            redfleshFish:   8,
            naturalPearl:   9,
            orehaCarp:      49,
            ancientRelic:   41,
            rareRelic:      9,
            orehaRelic:     57
        };
        expect(CalculateBestOreha(MATERIAL_COSTS).id).toBe("primeOreha");
    });
});

describe('CraftingMaterials', () => {
    it('correctly calculates equivalent prices from tradable materials', () => {
        MATERIAL_COSTS = {
            basicOreha:     11,
            superiorOreha:  22,
            primeOreha:     47,
            fish:           49,
            redfleshFish:   8,
            naturalPearl:   9,
            orehaCarp:      49,
            ancientRelic:   41,
            rareRelic:      9,
            orehaRelic:     57
        };
        SetMaterialCosts(MATERIAL_COSTS)
        const testCarp = new CraftingMaterial("orehaCarp");
        expect(
            [
                testCarp.calculateCost("redfleshFish"),
                testCarp.calculateCost("naturalPearl"),
                testCarp.calculateCost("fish"),
            ]
        ).toEqual(
            [
                5,
                5.625,
                6.125,
            ]
        );
    });

    it('correctly returns the itself if conversion is not cheaper', () => {
        MATERIAL_COSTS = {
            basicOreha:     11,
            superiorOreha:  22,
            primeOreha:     47,
            fish:           49,
            redfleshFish:   8,
            naturalPearl:   9,
            orehaCarp:      30,
            ancientRelic:   41,
            rareRelic:      9,
            orehaRelic:     57
        };
        SetMaterialCosts(MATERIAL_COSTS)
        const testCarp = new CraftingMaterial("orehaCarp");
        expect(testCarp.calculateBestCost()).toEqual(['orehaCarp', 3]);
    });

    it('correctly returns the material with the cheapest conversion if conversion is cheaper', () => {
        MATERIAL_COSTS = {
            basicOreha:     11,
            superiorOreha:  22,
            primeOreha:     47,
            fish:           49,
            redfleshFish:   4,
            naturalPearl:   9,
            orehaCarp:      49,
            ancientRelic:   41,
            rareRelic:      9,
            orehaRelic:     57
        };
        SetMaterialCosts(MATERIAL_COSTS)
        const testCarp = new CraftingMaterial("orehaCarp");
        expect(testCarp.calculateBestCost()).toEqual(["redfleshFish", 2.5]);
    });
});
