---
title: A Simple React Native Redux Example
date: "2017-06-18"
template: "post"
comments: true
description: "Working on my latest React Native project, I decided to make the jump from React’s state to Redux."
slug: "a-simple-react-native-redux-example"
category: "Open Source"
tags:
  - "Code"
  - "JavaScript"
  - "React Native"
  - "Redux"
---

Working on my latest React Native project, I decided to make the jump from React's state to Redux.

I looked through all the examples I could find, the majority were from 2015, and couldn't find something simple and minimal. Also, a lot of things have changed since 2015, and even 2016 - giving me a good excuse to start from scratch. My first step was to go through the Redux docs and tutorials to give myself a clean slate, instead of just copying code from my previous projects.

http://redux.js.org/docs/basics/ExampleTodoList.html

The above link has a minimal example of a Redux implementation, and is what I used as base for my project.

<figure>
  <img src="/media/a-simple-react-native-redux-example/1.png" alt="directory structure">
  <figcaption>
    This is the directory structure of the app which contains Components, Containers, and Reducers, pretty common with a standard React/Redux app.
  </figcaption>
</figure>


<figure>
  <img src="/media/a-simple-react-native-redux-example/2.gif" alt="example">
  <figcaption>Simple React Native Redux Example app running in iPhone Simulator.</figcaption>
</figure>

To show the list of items, I'm using the React Native ListView that is using a Redux Store(items) as its dataSource. There are two actions in the Reducer; ADD\_ITEM and REMOVE\_ITEM.

```javascript
// Start the sequence of item ID's at 0
let nextItemId = 0;
// Items reducer
const items = (state = [], action) => {
  switch (action.type) {
    case "ADD_ITEM": {
      return [
        ...state,
        {
          id: nextItemId++,
          name: action.name,
          bgColor: action.bgColor
        }
      ];
    }
    case "REMOVE_ITEM": {
      // Find index of item with matching ID and then
      // remove it from the array by its' index
      const index = state.findIndex(x => x.id === action.id);
      return [...state.slice(0, index), ...state.slice(index + 1)];
    }
    default:
      return state;
  }
};
export default items;
```

The ListView requires a dataSource, and must be re-rendered when the dataSource is updated. To do this, the dataSource gets mapped to a prop using mapStateToPros, and then we connect the Component to it.

```javascript
class ItemList extends Component {
  constructor(props) {
    super(props);
    this.handleDestroyItem = this.handleDestroyItem.bind(this);
  }
handleDestroyItem(id) {
    this.props.dispatch({ type: "REMOVE_ITEM", id });
  }
render() {
    return (
      <ListView
        style={styles.container}
        enableEmptySections={true}
        dataSource={this.props.dataSource}
        renderRow={rowData => {
          return (
            <Item
              rowData={rowData}
              handleDestroyItem={id => this.handleDestroyItem(id)}
            />
          );
        }}
      />
    );
  }
}
// Handle data source change from redux store
const dataSource = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1 !== r2
});
function mapStateToProps(state) {
  return {
    dataSource: dataSource.cloneWithRows(state.items)
  };
}
ItemList.propTypes = {
  dataSource: PropTypes.object,
  dispatch: PropTypes.func
};
export default connect(mapStateToProps)(ItemList);
```

View the entire code at https://github.com/aaronvb/react-native-redux-example.