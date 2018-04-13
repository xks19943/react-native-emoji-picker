'use strict'
import React, {
  Component
} from 'react'

import PropTypes from 'prop-types';
import {
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Platform,
} from 'react-native'
import ScrollableTabView from 'react-native-scrollable-tab-view';

import emoji from 'emoji-datasource'

import {
  groupBy,
  orderBy,
  includes,
} from 'lodash/collection'

import {
  mapValues,
} from 'lodash/object'

//polyfil for android
require('string.fromcodepoint');

// i dont understand ANY of this but there's somethign called codepoints and surrogate pairs
// and this converts utf16 to a charachter in javascript. see more here:
//https://mathiasbynens.be/notes/javascript-unicode
//https://mathiasbynens.be/notes/javascript-escapes#unicode-code-point
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint
const charFromUtf16 = utf16 => String.fromCodePoint(...utf16.split('-').map(u => '0x' + u))
const charFromEmojiObj = obj => charFromUtf16(obj.unified)
const blacklistedEmojis = ['white_frowning_face', 'keycap_star', 'eject']

const isAndroid = Platform.OS === 'android'
const letterSpacing = 10
const defaultEmojiSize = 30
const padding = 5
const filteredEmojis = emoji.filter(e => isAndroid ? !!e.google : !includes(blacklistedEmojis, e.short_name))
// sort emojis by 'sort_order' then group them into categories
const groupedAndSorted = groupBy(orderBy(filteredEmojis, 'sort_order'), 'category')

// convert the emoji object to a character
const emojisByCategory = mapValues(groupedAndSorted, group => group.map(charFromEmojiObj))
console.log(emojisByCategory);
const CATEGORIES = [
  {name:'符号',key:'Symbols'},
  {name:'旗帜',key:'Flags'}
];

class EmojiPicker extends Component {
  render() {
    return (
      <View style={this.props.style}>
        <ScrollableTabView
          tabBarPosition={'bottom'}
          style={styles.scrollableTabView}
          tabBarUnderlineStyle={styles.tabBarUnderlineStyle}
          tabBarTextStyle={styles.tabBarTextStyle}
          tabBarInactiveTextColor={'#888'}
          tabBarActiveTextColor={'#f0ab51'}>
          {
            CATEGORIES.map((obj)=>{
              return(
                <EmojiView
                  key={obj.key}
                  onEmojiSelected={this.props.onEmojiSelected}
                  category={obj.key}
                  tabLabel={obj.name}/>
              )
            })
          }
        </ScrollableTabView>

        {
          this.props.hideClearButton
            ? null
            : <ClearButon {...this.props} />
        }
      </View>
    )
  }

}

class EmojiView extends Component{
  static propTypes = {
    category:PropTypes.string.isRequired,
    onEmojiSelected:PropTypes.func,
    emojiSize:PropTypes.number,
  };

  render(){
    let {category,onEmojiSelected,emojiSize} = this.props;
    let emojis = emojisByCategory[category];
    let size = emojiSize || defaultEmojiSize;
    let style = {
      fontSize: size-4,
      color: 'black',
      textAlign: 'center',
      padding: padding,
    };

    return(
      <ScrollView
        style={{flex:1}}>
        <View style={{flex:1,flexDirection:'row',flexWrap:'wrap', padding: 16}}>
          {emojis.map(e =>
            <Text style={style}
                  key={e}
                  onPress={() => onEmojiSelected && onEmojiSelected(e)}>
              {e}
            </Text>
          )}
        </View>
      </ScrollView>
    )
  }
}

class EmojiCategory extends Component {
  componentDidMount() {
    this.props.finishedLoading()
  }

  render() {
    let emojis = emojisByCategory[this.props.category]
    let size = this.props.emojiSize || defaultEmojiSize
    let style = {
      fontSize: size-4,
      color: 'black',
      textAlign: 'center',
      padding: padding,
    };

    return (
      <View style={style.categoryOuter}>
        <Text style={[styles.headerText, this.props.headerStyle]}>{this.props.category}</Text>
        <View style={styles.categoryInner}>
          {emojis.map(e =>
            <Text style={style}
                  key={e}
                  onPress={() => this.props.onEmojiSelected(e)}>
              {e}
            </Text>
          )}
        </View>
      </View>
    )
  }
}


const ClearButon = props => {
  return (
    <TouchableOpacity
      style={styles.clear}
      onPress={() => props.onCancel && props.onCancel()}>
      <Text style={[styles.clearButton, props.clearButtonStyle]}>
        {props.clearButtonText || 'Clear'}
      </Text>
    </TouchableOpacity>
  )
}

const EmojiOverlay = props => (
  <View style={[styles.absolute, props.visible ? styles.visible : styles.hidden]}>
    <TouchableOpacity style={styles.absolute} onPress={props.onTapOutside}>
      <View style={styles.background} />
    </TouchableOpacity>
    {props.visible ? <EmojiPicker {...props}/> : null}
  </View>
)

let styles = StyleSheet.create({
  clear:{
    width:128,
    height:40,
    justifyContent:'center',
    alignItems:'center',
    alignSelf:'center'
  },
  clearButton: {
    textAlign: 'center',
    color: 'black',
    textAlignVertical: 'center',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  visible: {
    top: 0,
    flex: 1,
    justifyContent: 'center',
  },
  hidden: {
    top: 1000,
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: 'grey',
    opacity: 0.5,
  },
  categoryOuter: {
    flex: -1,
  },
  categoryInner: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'column',
  },
  headerText: {
    padding: padding,
    color: 'black',
    justifyContent: 'center',
    textAlignVertical: 'center',
  },
  tabBarTextStyle: {
    fontSize: 14,
  },
  tabBarUnderlineStyle: {
    backgroundColor: '#f0ab51',
    height: 2,
  },
  scrollableTabView: {
    flex:1
  },
});

EmojiPicker.propTypes = {
  onEmojiSelected: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
}

export { EmojiPicker as default, EmojiOverlay as EmojiOverlay }
