import { MATERIALS } from './materials.js';

var MATERIAL_COSTS;
var INPUT_MATERIALS;

/**
 * @param {Object} MaterialCosts                - Object of MaterialCosts
 * @param {string} MaterialCosts.fish           - cost of Fish
 * @param {string} MaterialCosts.redfleshFish   - cost of Redflesh Fish
 * @param {string} MaterialCosts.naturalPearl   - cost of Natural Pearl
 * @param {string} MaterialCosts.orehaCarp      - cost of Oreha Carp
 * @param {string} MaterialCosts.ancientRelic   - cost of Ancient Relic
 * @param {string} MaterialCosts.rareRelic      - cost of Rare Relic
 * @param {string} MaterialCosts.orehaRelic     - cost of Oreha Relic
 * @param {string} MaterialCosts.basicOreha     - cost of Basic Oreha
 * @param {string} MaterialCosts.superiorOreha  - cost of Superior Oreha
 * @param {string} MaterialCosts.primeOreha     - cost of Prime Oreha
 */
const N_PER_BUNDLE = {
    fish:           100,
    redfleshFish:   10,
    naturalPearl:   10,
    orehaCarp:      10,
    ancientRelic:   100,
    rareRelic:      10,
    orehaRelic:     10,
    basicOreha:     1,
    superiorOreha:  1,
    primeOreha:     1
};

const COST_PER_FUSIONMAT_CRAFT = {
    basicOreha:      182,
    superiorOreha:   222,
    primeOreha:      267
};

const N_PER_CRAFT = {
    basicOreha: {
        input: {
            fishing: {
                fish:           80, 
                naturalPearl:   40, 
                orehaCarp:      10
            },
            excavating: {
                ancientRelic: 64, 
                rareRelic: 26, 
                orehaRelic: 8
            },
        },
        output: 30
    },
    superiorOreha: {
        input: {
            fishing: {
                fish: 128, 
                naturalPearl: 64, 
                orehaCarp: 16
            },
            excavating: {
                ancientRelic: 96, 
                rareRelic: 29, 
                orehaRelic: 16
            },
        },
        output: 20
    },
    primeOreha: {
        input: {
            fishing: {
                fish: 142, 
                naturalPearl: 69, 
                orehaCarp: 52
            },
            excavating: {
                ancientRelic: 107, 
                rareRelic: 51, 
                orehaRelic: 52
            },
        },
        output: 15
    },
};

const CONVERSION_RATES = {
    orehaCarp: {
        naturalPearl: 10/100*80/50, // orehaCarp per naturalPearl
        redfleshFish: 10/100*80/50, // orehaCarp per redfleshFish
        fish:         10/100*80/100 // orehaCarp per fish
    },
    naturalPearl: {
        redfleshFish: 50/100*80/50, // naturalPearl per redfleshFish
        fish:         50/100*80/100 // naturalPearl per fish
    },
    orehaRelic: {
        rareRelic:    10/100*80/50, // orehaRelic per rareRelic
        ancientRelic: 10/100*80/100 // orehaRelic per ancientRelic
    },
    rareRelic: {
        ancientRelic: 50/100*80/100 // rareRelic per ancientRelic
    }
};

// CRAFTING_MATERIALS are the raw items used during crafting
const CRAFTING_MATERIALS = [
    "fish",
    "naturalPearl",
    "orehaCarp",
    "ancientRelic",
    "rareRelic",
    "orehaRelic"
]

export class CraftingMaterial {
    constructor(id) {
        this.id = id;
        this.name = MATERIALS[id].name;
        [this.bestMaterial, this.bestCost] = this.calculateBestCost();
    }

    calculateCost(material) {
        return (MATERIAL_COSTS[material]/N_PER_BUNDLE[material]) / CONVERSION_RATES[this.id][material]
    }

    calculateBestCost() {
        if (this.id in CONVERSION_RATES) {
            const barters = Object.keys(CONVERSION_RATES[this.id])
            let barterPrices = barters.map((material) => this.calculateCost(material));
            barterPrices = [MATERIAL_COSTS[this.id]/N_PER_BUNDLE[this.id], ...barterPrices]
            const bestCost = Math.min.apply(Math, barterPrices);
            return [[this.id, ...barters][barterPrices.findIndex(price => price === bestCost)], bestCost]
        }
        return [this.id, MATERIAL_COSTS[this.id]/N_PER_BUNDLE[this.id]]
    }
}
//   # g              # g           ac
//   ------   <=>     ------- * -------
//   10 rr           10 ac          rr

export class OrehaFusionMaterial {
    constructor(id) {
        this.id = id
        this.name = MATERIALS[id].name;
        [this.cheapestMaterial, this.cheapestCost] = this.calculateCheapestCost();
    }

    calculateCost(tradeSkill) {
        return Object.entries(N_PER_CRAFT[this.id]['input'][tradeSkill]).reduce((cost, [item, N]) => {
            return cost + N * INPUT_MATERIALS[item].bestCost
        }, COST_PER_FUSIONMAT_CRAFT[this.id]) / N_PER_CRAFT[this.id].output
    }

    calculateCheapestCost() {
        const tradeSkills = Object.keys(N_PER_CRAFT[this.id].input)
        const costsPerTradeSkill = tradeSkills.map((tradeSkill) => this.calculateCost(tradeSkill))
        const bestCost = Math.min.apply(Math, costsPerTradeSkill);
        const cheapeastMateral = tradeSkills[costsPerTradeSkill.findIndex(price => price === bestCost)]
        this.materials = Object.keys(N_PER_CRAFT[this.id]['input'][cheapeastMateral]).reduce((items, item) => {
            return ([
                ...items,
                INPUT_MATERIALS[item]
            ])
        }, [])
        return [cheapeastMateral, bestCost]
    }
};

export const SetMaterialCosts = (materialCosts) => {
    MATERIAL_COSTS = materialCosts

    INPUT_MATERIALS = CRAFTING_MATERIALS.reduce((allMaterials, inputMaterial) => {
        return {
            ...allMaterials,
            [inputMaterial]: new CraftingMaterial(inputMaterial)
        }
    }, {})
}

export const CalculateBestOreha = (materialCosts) => {
    SetMaterialCosts(materialCosts)

    const orehas = [
        'basicOreha',
        'superiorOreha',
        'primeOreha'
    ]
    const OrehaFusionMaterials = orehas.reduce((allOrehas, oreha) => {
        return (
            {
                ...allOrehas,
                [oreha]: new OrehaFusionMaterial(oreha)
            }
        )}, {});

    const profitMargins = orehas.map((materialName) => {
        return (MATERIAL_COSTS[materialName] - OrehaFusionMaterials[materialName].cheapestCost) / OrehaFusionMaterials[materialName].cheapestCost
    })
    const bestProfitMargin = Math.max.apply(Math, profitMargins);
    let bestOreha = OrehaFusionMaterials[orehas[profitMargins.findIndex(profitMargin => profitMargin === bestProfitMargin)]]
    bestOreha.profitMargin = bestProfitMargin

    return (
        bestOreha
    )
};

export default CalculateBestOreha
