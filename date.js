exports.getDate = () =>{
  let today = new Date();
  let options = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  return today.toLocaleDateString("en-US", options);
};

// module.exports = getDate;

// function getDate(){
//   ...
// };

// exports = getDate(){...};
// const date = require(__dirname + "/date.js");
// let myDates = date();


// exports.getDate = ()=>{...};
// exports.getDay = ()=>{...};

// const date = require(__dirname + "/date.js");
// let myDate = date.getDate();
// let myDay = date.getDay();