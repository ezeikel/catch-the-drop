import React, { Component } from 'react';
import Downshift from 'downshift';
import Router from 'next/router';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import debounce from 'lodash.debounce';
import { Dropdown, DropdownItem, SearchStyles } from './styles/Dropdown';

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(where: {
      OR: [
        { title_contains: $searchTerm },
        { description_contains: $searchTerm }
      ]
    }) {
      id
      image
      title
    }
  }
`;

class AutoComplete extends Component {
  state = {
    items: [],
    loading: false
  }

  onChange = debounce(async (e, client) => {
    // turn loading on
    this.setState({ loading: true });
    // manually query apollo client
    const res = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm: e.target.value }
    });

    this.setState({
      items: res.data.items,
      loading: false
    })
  }, 350);

  render() {
    return (
      <SearchStyles>
        <div>
          <ApolloConsumer>
            {client => (
              <input type="search" onChange={e => {
                e.persist();
                this.onChange(e, client);
              }} />
            )}
          </ApolloConsumer>
          <Dropdown>
            <p>Items will go here</p>
            {this.state.items.map(item => (
              <DropdownItem key={item.id}>
                <img width="50" src={item.image} alt={item.title} />
                {item.title}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </SearchStyles>
    );
  }
}

export default AutoComplete;
