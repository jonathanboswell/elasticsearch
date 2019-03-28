import React from 'react'
import ReactDOM from 'react-dom'
import Autosuggest from 'react-autosuggest'
import axios from 'axios'
import { debounce } from 'throttle-debounce'

import 'bootstrap/dist/css/bootstrap.css'
import "font-awesome/css/font-awesome.css"
import './style.css'
import logo from './logo.png'

class AutoComplete extends React.Component {
  state = {
    value: '',
    suggestions: []
  }

  componentWillMount() {
    this.onSuggestionsFetchRequested = debounce(
      200,
      this.onSuggestionsFetchRequested
    )
  }

  renderSuggestion = suggestion => {
    return (
      <div className="result">
        <div>{suggestion.name}</div>
        <div className="alert alert-success">${suggestion.price}</div>
      </div>
    )
  }

  onChange = (event, { newValue }) => {
    this.setState({ value: newValue })
  }

  onSuggestionsFetchRequested = ({ value }) => {
    // Give it a shot:
    // - only include results that score greater than 5
    // - show just the top 5 results
    // - if no results show "No results" in the suggestion box
    // - navigate to the pdp_url when a selection is made (hint: see getSuggestionValue)
    // - use match_phrase instead of multi_match
    axios
      .post('http://localhost:9200/products/_search', {
        query: {
          multi_match: {
            query: value,
            fields: ['name']
          }
        },
        sort: ['_score', { price: 'desc' }],
        size: 100
      })
      .then(res => {
        console.log(res);
        let results = res.data.hits.hits.map(h => h._source);
        // let results = [];
        // let duplicateNames = {};
        // res.data.hits.hits.map(h => {
        //     h = h._source;
        //     if(!duplicateNames[h.name]) {
        //         results.push(h);
        //         duplicateNames[h.name] = true;
        //     }
        //     return h;
        // });
        this.setState({ suggestions: results })
      })
  }

  onSuggestionsClearRequested = () => {
    this.setState({ suggestions: [] })
  }

  render() {
    const { value, suggestions } = this.state

    const inputProps = {
      placeholder: 'Shop Now __',
      className: 'form-control',
      value,
      onChange: this.onChange
    }

    return (
        <div className="App container-fluid">
          <div className="row">
            <div className="col p-2">
              <img src={logo} id="logo" className="img-fluid" alt="logo" />
            </div>
          </div>
          <div className="row">
            <div className="col cool-dude">
              <div className="row">
                <div className="col-11 col-sm-8 col-md-4 offset-md-1 text-left">
                  <h1>Warmer Months, Cooler Shirts</h1>
                  <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                    getSuggestionValue={suggestion => suggestion.name}
                    renderSuggestion={this.renderSuggestion}
                    inputProps={inputProps}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }
}

const rootElement = document.getElementById('root')
ReactDOM.render(<AutoComplete />, rootElement)
