/* eslint-disable no-unused-vars */
import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { debounce } from "lodash";
import PropTypes from "prop-types";
import * as api from "../app/backendCalls";
import Octicon from "./Octicon";

class SearchBar extends Component {
  state = {
    content: [],
    searchString: "",
    isFocused: false,
    isLoading: false,
  };
  
  static propTypes = {
    history: PropTypes.object,
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  onChange = e => {
    const { value } = e.target;
    this.setState({ searchString: value, isLoading: true }, () => this.searchContent(value));
  };

  onSubmit = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      const { searchString } = this.state;
      if (searchString.length > 0) {
        this.props.history.push(`/search/${ searchString }`);
      }
    }
  };

  searchContent = debounce(value => {
    api.searchContentTitles(value).then(({ data }) => {
      this.setState({ content: data, isLoading: false });
    });
  }, 300);

  onBlur = e => {
    // Delay onBlur to provide time for redirect
    this.timeout = setTimeout(() => this.setState({ isFocused: false }), 150);
  };

  render() {
    const { content, searchString, isFocused, isLoading } = this.state;

    return (
      <form
        className="mt-3 flex-item search border rounded d-flex align-items-center position-relative p-2"
        ref={c => (this.searchbar = c)}
        onKeyPress={this.onSubmit}
        onFocus={() => this.input.focus()}
        onClick={() => this.input.focus()}
        tabIndex="0"
        style = {{ maxWidth: "400px" }}
      >
        <Octicon name="search" className="d-flex align-items-center mr-2" fill="#a8a8a8" />
        <input
          type="search"
          onChange={this.onChange}
          value={searchString}
          onFocus={() => this.setState({ isFocused: true })}
          onBlur={this.onBlur}
          ref={c => (this.input = c)}
          className="search-input"
          placeholder="Search for titles or topics..."
        />
          {isFocused && (
            <div className="search-overlay position-absolute bg-white rounded border border-muted">
              {isLoading && (
                <div className="py-2 px-3 text-muted">
                  <i className="fas fa-spinner fa-spin mr-1" />
                  <span>Searching for Books...</span>
                </div>
              )}
              {!isLoading &&
                content.length > 0 && (
                  <div className="text-dark d-flex flex-column py-2">
                    {content.slice(0, 6).map(el => (
                      <Link to={`/titles/${el.id}`} className="py-2 px-3 text-dark" key={el.id}>
                        {el.title}
                      </Link>
                    ))}
                  </div>
                )}
              {!isLoading &&
                content.length === 0 && (
                  <div className="py-2 px-3 text-muted">
                    No titles found matching {searchString}
                  </div>
                )}
            </div>
          )}
      </form>
    );
  }
}

export default withRouter(SearchBar);
