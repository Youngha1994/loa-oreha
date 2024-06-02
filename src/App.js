import { Component, Fragment, useRef } from 'react';
import { MATERIALS } from './components/materials.js';
import CalculateBestOreha from './components/calculations.js';
import './App.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  const resultRef = useRef(null);
  const DEFAULT_INPUTS = {
    "ancientRelic": "",
    "fish": "",
    "redfleshFish": "",
    "naturalPearl": "",
    "rareRelic": "",
    "basicOreha": "",
    "orehaCarp": "",
    "orehaRelic": "",
    "superiorOreha": "",
    "primeOreha": ""
}
  const inputFields = JSON.parse(localStorage.getItem('prices')) || DEFAULT_INPUTS

  function submitCalculations (e) {
    e.preventDefault();
    const form = e.target;
    let formData = new FormData(form);
    formData = Object.fromEntries(formData.entries())
    localStorage.setItem('prices', JSON.stringify(formData));

    const bestOreha = CalculateBestOreha(formData);
    resultRef.current.setState( { bestOreha: bestOreha })
    resultRef.current.toggleSlide();
  };
  function SetupHelp() {
    return (
      <div className='help-icon'>
        <i 
          className='help-icon bi-info-circle'
        />

        <div id='help' className='tooltip'>
          <div className='help-text'>
            <p>Favorite the relevant Fishing Materials, Excavating Materials, and Oreha Fusion Materials.</p>
            <p>Open the <b>Interest List</b> and sort by Rank.</p>
            <p>Enter the prices into the input form below.</p>
          </div>
          <div>
            <img className='loa-screenshot' src='./loa_market_example.png' alt='Market Example'/>
          </div>
        </div>
      </div>
    )
  }

  function Materials() {
    return (
      Object.values(MATERIALS).map((item) => {
        return (
          <Fragment key={item.id}>
            <div className='material-label'>
              <img className='material-icon' src={item.image} alt={item.name + " image"} />
              <span className='material-title'>{item.name}</span>
            </div>
            <input 
              className='material-price' 
              name={item.id}
              defaultValue={inputFields[item.id]}
            />
          </Fragment>
        )
      })
    )
  }
  
  function MarketPrices() {
    return (
      <form method='post' onSubmit={submitCalculations}>
          <div id="input-grid">
            <Materials />
          </div>
          <br />
          <button type='submit'>Submit</button>
          <Results ref={resultRef}/>
      </form>
    )
  }

  class Results extends Component {
    constructor(props){
      super(props);
      this.state = {
        slideIn: true,
        bestOreha: {
          name: ""
        }
      };
    }
    
    toggleSlide() {
      this.setState( {slideIn: false} )
    }

    render() {
      const { slideIn } = this.state;
      const item = this.state.bestOreha;

      const itemImagePath = MATERIALS[item.id]?.image
      let instructions = ""
      
      if (item.profitMargin > 0) {
        item.profitMargin = Math.round(item.profitMargin * 100)
        const conversions = item.materials.reduce((conversions, material) => {
          let conversion = <span>Buy {material.name}. </span>
          let conversion_image = <img className='material-icon' src={MATERIALS[material.id].image} alt={MATERIALS[material.id].name + "image"}/>
          if (material.bestMaterial !== material.id) {
            conversion = `Buy ${MATERIALS[material.bestMaterial].name} and convert to ${material.name}. `
            conversion_image = <Fragment>
              <img className='material-icon' src={MATERIALS[material.bestMaterial].image} alt={MATERIALS[material.bestMaterial].name + " image"}/>
              <i className='bi-caret-right-fill' />
              {conversion_image}
            </Fragment>
          }
          return (
            <Fragment>
              {conversions}
              <div className='instruction-with-image'>
                {conversion}
                {conversion_image}  
              </div>
            </Fragment>
          )
        }, <Fragment />)
        instructions = (
          <Fragment>
          <div className='instruction-with-image'>
            <span>The best profit margin is from crafting {item.name} with a {item.profitMargin}% margin.</span>
            <img className='material-icon' src={itemImagePath} alt={item.name + " image"}/>
          </div>
          <p>Craft using {item.cheapestMaterial} materials.</p>
          {conversions}
            
          </Fragment>
        )
      } else {
        instructions = (
          <span>Despair. Doom. Orehas are worth less than their cost.</span>
        )
      }

      return (
        <div id='result' className={`result ${slideIn? 'slideLeft' : ''}`}>
          Instructions
          <hr />
          { instructions }
        </div>
      )
    }
  }
  
  return (
    <div>
      <h1>Lost Ark Oreha Crafting Calculator</h1>
        <div className='component-with-help'>
          <h2 id='market-prices-header'>Market Prices</h2>
          <SetupHelp />
        </div>
        <MarketPrices />
    </div>
  )
}

export default App;
