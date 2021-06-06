import React,{Component} from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  TouchableHighlight} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader'
import {BookSearch} from 'react-native-google-books'

export default class BookRequestScreen extends Component{
  constructor(){
    super();
    this.state ={
      userId : firebase.auth().currentUser.email,
      bookName: "",
      reasonToRequest: "",
      requestId: "",
      requestedBookName: "",
      bookStatus: "",
      docId: "",
      isBookRequestActive: "",
      userDocId: "",
      dataSource: "",
      showFlatlist: false
    }
  }

  createUniqueId(){
    return Math.random().toString(36).substring(7);
  }

  async getBooksFromAPI(bookName){
    this.setState({
      bookName: bookName
    })
    if(bookName.length > 2){
      var books = await BookSearch.searchbook(bookName, 'AIzaSyDEeOXrtjyOdOHfuCS65utiYFROwEdk-Q4')
      console.log(books + " Book API data")
      this.setState({
        dataSource: books.data,
        showFlatlist: true
      })
    }else{
      this.setState({
        showFlatlist: false
      })
    }
  }

  renderItem = ({item, i}) => {
    return(
      <TouchableHighlight style = {styles.highlight}
                          activeOpacity = {0.6}
                          underlayColor = "#DDDDDD"
                          onPress = {() =>  {
                            this.setState({
                              showFlatlist: false,
                              bookName: item.volumeInfo.title
                            })
                          }}
                          bottomDivider
      > 
      <Text> {item.volumeInfo.title} </Text>
      </TouchableHighlight>
    )
  }

  getBookRequest = () => {
    var bookRequest = db.collection('requested_books').where('user_id','==',this.state.userId).get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if(doc.data() != "received"){
          this.setState({
            requestId: doc.data().request_id,
            requestedBookName: doc.data().book_name,
            bookStatus: doc.data().book_status,
            docId: doc.id
          })
        }
      })
    })
  }

  getIsBookRequestActive(){
    db.collection('users').where('email_id','==',this.state.userId).onSnapshot(snapshot => {
      snapshot.forEach(doc => {this.setState({
        isBookRequestActive: doc.data().isBookRequestActive,
        userDocId: doc.id
      })})
    })
    console.log(this.state.isBookRequestActive + " BookRequestActive")
  }

  addRequest = async (bookName,reasonToRequest) => {
    var userId = this.state.userId
    var randomRequestId = this.createUniqueId()
    db.collection('requested_books').add({
        "user_id": userId,
        "book_name": bookName,
        "reason_to_request": reasonToRequest,
        "request_id": randomRequestId,
        "book_status": "requested"
    })

    await this.getBookRequest()
    console.log(this.state.userId + "getBookRequest")
    db.collection('users').where('email_id','==',this.state.userId).get().then((snapshot) => {
      snapshot.forEach((doc) => {db.collection('users').doc(docId).update({isBookRequestActive: true})})
    })

    this.setState({
        bookName :'',
        reasonToRequest : ''
    })

    return Alert.alert("Book Requested Successfully")
  }

  componentDidMount(){
    this.getBookRequest()
    this.getIsBookRequestActive()
  }

  render(){
    console.log(this.state.isBookRequestActive + "Book Request")
    if(this.state.isBookRequestActive == true){
      return(
        <View>
          <Text>Book Name: {this.state.requestedBookName} </Text>
          <Text>Book Status: {this.state.bookStatus} </Text>
        </View>
      )
    }
    else{
      return(
        <View style={{flex:1}}>
          <MyHeader title="Request Book" navigation ={this.props.navigation}/>
            <KeyboardAvoidingView style={styles.keyBoardStyle}>
              <TextInput
                style ={styles.formTextInput}
                placeholder={"enter book name"}
                onChangeText={(text)=>{
                    this.getBooksFromAPI(text)
                }}
                onClear = {text => this.getBooksFromAPI(' ')}
                value={this.state.bookName}
              />

              {this.state.showFlatlist?(
                <FlatList data = {this.state.dataSource}
                          renderItem = {this.renderItem}
                          enableEmptySections = {true}
                          style = {{marginTop: 10}} 
                          keyExtractor = {(item, index) => index.toString()}
                />
              ):(
                <TextInput
                  style ={[styles.formTextInput,{height:300}]}
                  multiline
                  numberOfLines ={8}
                  placeholder={"Why do you need the book"}
                  onChangeText ={(text)=>{
                      this.setState({
                          reasonToRequest:text
                      })
                  }}
                  value ={this.state.reasonToRequest}
                />
              )}
              <TouchableOpacity
                style={styles.button}
                onPress={()=>{this.addRequest(this.state.bookName,this.state.reasonToRequest)}}
                >
                <Text>Request</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  keyBoardStyle : {
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  formTextInput:{
    width:"75%",
    height:35,
    alignSelf:'center',
    borderColor:'#ffab91',
    borderRadius:10,
    borderWidth:1,
    marginTop:20,
    padding:10,
  },
  button:{
    width:"75%",
    height:50,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    backgroundColor:"#ff5722",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    marginTop:20
    },
    highlight:{
      alignItems: "center",
      padding: 10,
      width: "90%",
      backgroundColor: "#DDDDDD"
    }
  }
)
