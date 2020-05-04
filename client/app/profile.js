let token, imageURLS;
let fixedURI = [];


const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    token = result.csrfToken;
    getImages(token);
  });
};

const handleConnect = (e) =>{
  e.preventDefault();

  sendAjax('POST', '/connect', `_csrf=${token}`, redirect);
}

const ConnectWindow = () =>{
  return(
      <form id="connectForm"
      onSubmit={handleConnect}
      name="connectForm"
      className="connectForm"
      >
        <input id="connect" className="formSubmit" type="submit" value="Join Lobby" />
      </form>
  );
  }

const handleChange = (e) => {
  e.preventDefault();

  $("#domoMessage").animate({width:'hide'},350);

  if ($("#oldPass").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
    handleError("All fields are required");
    return false;
  }

  if ($("#pass").val() !== $("#pass2").val()) {
    handleError("Passwords do not match");
    return false;
  }

  sendAjax('POST', $("#passForm").attr("action"), $("#passForm").serialize(), redirect);

  return false;
};

const PasswordWindow = (props) =>{
  return(
      <form id="passForm"
        name="passForm"
        onSubmit={handleChange}
        action="/changePass"
        method="POST"
        className="mainForm"
      >
        <label htmlFor="oldPass">Current Password: </label>
        <input id="oldPass" type="password" name="oldPass" placeholder="Old password"/>
        <label htmlFor="pass">New Password: </label>
        <input id="pass" type="password" name="pass" placeholder="New password"/>
        <label htmlFor="pass2">New Password: </label>
        <input id="pass2" type="password" name="pass2" placeholder="New password"/>
        <input type="hidden" name="_csrf" value={props.csrf} />
        <input className="formSubmit" type="submit" value="Sign in"/>
      </form>
    );
  }

  const Images = () =>{
    return(
      <div className="images">
        {fixedURI.map((value, index) => {
          return <img key={index} src={value} className="image"></img>
        })}
      </div>
      );
  }


  const getImages = () =>{
    sendAjax('GET', '/images', null, (results) =>{
      imageURLS = results.Drawings;
      //The URI's are stored properly in mongoose, however they're not being retrieved properly.  Instead of the + they're saved with
      //They're being retrieved with spaces.  Until I determine what's wrong, this code'll fix the problem.  Also only displaying the last saved img
      //to reduce clutter on screen
      for (let i = 0; i < imageURLS.length; i++){
        fixedURI[i] = imageURLS[i].img.replace(/ /g, "+");
      }
      createContent();
      createPass();
      displayArt();
    });
  }

const createContent = () => {
  ReactDOM.render(
    <ConnectWindow/>,
    document.querySelector("#profile")
  );
};

const createPass = () =>{
  ReactDOM.render(
    <PasswordWindow csrf={token}/>,
    document.querySelector("#change")
  );
};

const displayArt = () => {
  if (imageURLS.length > 0){
    ReactDOM.render(<Images />, document.querySelector("#images"));
  }
}


$(document).ready(function() {
  getToken();
});
