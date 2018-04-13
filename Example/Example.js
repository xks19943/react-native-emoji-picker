import React, {
  Component,
} from 'react'

import {
 StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TextInput
} from 'react-native'
import PropTypes from 'prop-types';

import { EmojiOverlay } from '../'
// var {EmojiOverlay} = require('../')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  emoji: {
    fontSize: 50,
    textAlign: 'center',
    margin: 50,
    color: 'black'
  },
  input:{
    width:128,
    alignSelf:'center',
    padding:0
  }
});


/**
 * onSelectionChange function
 * 长按选择文本时，选择范围变化时调用此函数，传回参数的格式形如 { nativeEvent: { selection: { start, end } } }
 * 当只有光标位置的时候是 start === end
 * 因此可以理解为 end就是光标的位置
 */

class Example extends Component {
  constructor(props){
    super(props);
    this.state = {
      val: '',
      showPicker: false,
      selection:0,
      selectedEmoji:null
    };
  }


  _emojiSelected = emoji => {
    let val = this.state.val;
    let newValue = val.slice(0,this.state.selection) + emoji + val.slice(this.state.selection);
    this.setState({
      showPicker: false,
      val:newValue,
      selectedEmoji:emoji
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          ref={r=>this.input = r}
          onSelectionChange={(e)=>{
            this.setState({
              selection:e.nativeEvent.selection.end
            })
          }}
          onChangeText={(v)=>{
            this.setState({
              val:v
            })
          }}
          defaultValue={this.state.val}
          style={styles.input}
          placeholder={'请输入表情'}
          underlineColorAndroid={'transparent'}/>
        <TouchableHighlight
          onPress={() => this.setState({showPicker: true})}>
          <Text style={styles.emoji}>
            {this.state.selectedEmoji || 'no emoji selected'}
          </Text>
        </TouchableHighlight>

        <EmojiOverlay
          style={{
            height: 400,
            backgroundColor: '#f4f4f4'
          }}
          onCancel={()=>{
            this.setState({
              showPicker:false
            })
          }}
          horizontal={true}
          visible={this.state.showPicker}
          onEmojiSelected={this._emojiSelected.bind(this)}
          onTapOutside={() => this.setState({showPicker: false})} />

      </View>
    );
  }
};

module.exports = Example
