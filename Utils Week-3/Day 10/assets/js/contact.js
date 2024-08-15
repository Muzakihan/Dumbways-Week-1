
//TYPE DATA DAN VARIABLE
// var myName = "Farhan Muzaki";
// console.log('My name : ' , myName);
// myName = "Muhammad Farhan Muzaki";
// console.log('My age : ' , myName);

// let myAge = 23;
// console.log('My age : ' , myAge);
// myAge = 24;
// console.log('My age : ' , myAge);

// const myHome = 'Sukabumi';
// console.log('My home : ' , myHome);
// myHome = 'Bogor';
// console.log('My home : ' , myHome);

//TYPE DATA DAN ARRAY

// script.js

function showDataForm(event) {
    event.preventDefault();
  
    let name = document.getElementById('nameInput').value;
    let email = document.getElementById('emailInput').value;
    let no_telp = document.getElementById('no_telpInput').value;
    let position = document.getElementById('positionInput').value;
    let address = document.getElementById('addressInput').value;
  
    if (!name || !email || !no_telp || !position || !address) {
        window.alert("Semua field harus diisi!");
      return; 
    }
  
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("No Telp:", no_telp);
    console.log("Position:", position);
    console.log("Address:", address);
  }
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', showDataForm);
  
  
  
  