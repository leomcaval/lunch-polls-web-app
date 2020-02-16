function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');

  // Build and return HTML in IFRAME sandbox mode.
  return template.evaluate()
      .setTitle('Lunch Poll Results')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}



function remove(array, element) {
  var index = array.indexOf(element);
  array.splice(index, 1);
}



function getFormData() {
 
  //read data from form
  var formID = '1mbJ7KwO5mu9iFfiWPNHPiOyKxBlxBmQHHxdAH9dvaFM'; 
  var form = FormApp.openById(formID);
  var formResponses = form.getResponses();
  var formData = [];
  for (var i = 0; i < formResponses.length; i++) {
    var formResponse = formResponses[i]; 
    var itemResponses = formResponse.getItemResponses();
    formData.push({name: itemResponses[0].getResponse(),votes: itemResponses[1].getResponse()});
    
  }
  
  //retrive info from questions
  var ques = form.getItems(); // 0:names and 1:restaurants
  var restaurantsChoices = ques[1].asCheckboxItem().getChoices()
  var restaurants = [];
  var peopleChoices = ques[0].asListItem().getChoices()
  var people = [];
  for (i in peopleChoices) {
    people.push(peopleChoices[i].getValue()); 
  }
  for (i in restaurantsChoices) {
    restaurants.push(restaurantsChoices[i].getValue()); 
  }
  
  //do not allow multiple time votes
  for (var i = 0; i < formData.length; i++) {
    for (var j = 0; j < formData.length; j++) {
      if (formData[i].name == formData[j].name && i!=j) {
        remove(formData, formData[j])
        j--;
      }
    }
  }
  
  //up to 3 restaurants
   for (var i = 0; i < formData.length; i++) {
     if(formData[i].votes.length > 3) {
       formData[i].votes.splice(3, formData[i].votes.length); //remove from 3 onwards, keep 012
     }
   }
  
  // if user cannot make it, ensure that the only vote that counts is "sorry", (assuming "sorry" is the first option)
  for (var i = 0; i < formData.length; i++){
    for(var j = 0; j < formData[i].votes.length; j++){
      if (formData[i].votes[j] == restaurants[0]) {
        formData[i].votes.splice(1, formData[i].votes.length); //remove from 1 onwards, keep 0
      }
    }
  }
    
      
  
  //counting votes
  var rank = [];
  var voters = [];
  var numVoters = 0;
  for (var i = 0; i < restaurants.length; i++) {
    for (var j = 0; j < formData.length; j++){
      for(var k = 0; k < formData[j].votes.length; k++){
        if (formData[j].votes[k] == restaurants[i]) {
          numVoters+=1;
          voters.push(formData[j].name);
        }
      }
    }
    rank[i] = {restaurant: restaurants[i], voters: voters, numVoters: numVoters};
    numVoters = 0;
    voters = [];
  }
  
  //sort rank 
  rank.sort(function(a,b) {
    if(a.numVoters < b.numVoters){
      return 1;
    } else if((b.numVoters < a.numVoters)){
      return -1;
    } else {
      return 0;
    }})
  
  // compact form
  //rank.sort(function(a,b) {return (a.numVoters < b.numVoters) ? 1 : ((b.numVoters < a.numVoters) ? -1 : 0);} );
  
  //put "sorry" at the end  (assuming "sorry" is the first option)
  rank.sort(function(a,b) {
    if(b.restaurant == restaurants[0]){
      return -1;
    } else {
      return 0;
    }})
  
    
  //convert object to string
  var rankJSON = new Array(rank.length);
  for (var i = 0; i < rankJSON.length; i++) {
    rankJSON[i]=JSON.stringify(rank[i]);
  }
  
  var formDataJSON = new Array(formData.length);
  for (var i = 0; i < formData.length; i++) {
    formDataJSON[i]=JSON.stringify(formData[i]);
  }
  
  data = [rankJSON,formDataJSON];
  
  //send out string
  return (data.length > 1) ? data : null;
}