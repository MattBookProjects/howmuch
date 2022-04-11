
var API_URLS = {
    register: "register",
    user_short_form: "user/shortform"
};

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {page: <RegisterPage app={this}/>, navbarFactory: new NavBarFactory()}
    }

    componentDidMount() {
        this.state.navbarFactory.getNavBar().then(navbar => {
            this.setState({navbar: navbar});
        });
        
    }

    render(){
        if( !this.state.navbar)
            return (
                <div className="app">
                    LOADING
                </div>
            );
        return (
            <div className="app">
                {this.state.navbar}
                {this.state.page}
            </div>
        );
    }
}

class NavBar extends React.Component {
    constructor(props){
        super(props);
        this.state = {items: props.items};
    }

    render() {

        if( !this.state.items ){
            return <div>LOADING</div>;
        } 
            
        return (
            <div className="navbar">
                {this.state.items}
            </div>
        );
    }

}

class NavItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {label: props.label, onclick: props.onclick};
    }

    render() {
        return (
            <div className="nav-item" onClick={this.state.onclick}>{this.state.label}</div>
        );
    }

}

class NavBarFactory {
    constructor(app){
        this.app = app;
    }

    async getNavBar(){
        const data = await fetch(API_URLS.user_short_form).then(response => response.json());
        if( data.user ){
            return <NavBar items={[
                <NavItem label={"HOWMUCH"} onclick={() => this.app.setMainPage()}/>,
                <NavItem label={data.user.username} onclick={() => this.app.setUserPage()}/>,
                <NavItem label={"LOGOUT"} onclick={() => this.app.setLoginPage()}/>,
            ]}/>;
                    
        } else {
            return <NavBar items={[
                <NavItem label={"HOWMUCH"} onclick={() => this.app.setMainPage()}/>,
                <NavItem label={"LOGIN"} onclick={() => this.app.setLoginPage()}/>,
                <NavItem label={"REGISTER"} onclick={() => this.app.setRegisterPage()}/>,
            ]}/>;
        }
    }
}

class RegisterPage extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {app: props.app}
    }

    render() {
        return (
            <div className="register-page">
                <div className="form-label">REGISTER</div>
                <RegisterForm app={this.state.app}/>
            </div>
        )
    }

}


class RegisterForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            app: props.app,
            usernameInput: <TextInput placeholder="Username"/>,
            passwordInput: <PasswordInput placeholder="Password"/>,
            repeatPasswordInput: <PasswordInput placeholder="Repeat Password"/>,
            submitButton: <Button label="REGISTER" onClick={this.handleSubmit}/>
        }
    }

    handleSubmit() {
        const username = this.state.usernameInput.getValue();
        const password = this.state.passwordInput.getValue();
        const repeatPassword = this.state.repeatPasswordInput.getValue();
        
        if( this.state.errorMessage ){
            this.setState({errorMessage: undefined});
        }
        if( username === "" ){
            this.setState({errorMessage: <ErrorMessage message={"Username can't be empty"}/>});
        }
        else if( password === ""){
            this.setState({errorMessage: <ErrorMessage message={"Password can't be empty"}/>});
        }
        else if( password !== repeatPassword ){
            this.setState({errorMessage: <ErrorMessage message={"Passwords don't match"}/>});
        }
        else {
            fetch(API_URLS.register, {
                method: 'POST',
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }).then(response => {
                if( response.status_code === 201 ){
                    this.app.setMainPage();
                }
                else if(response.status_code === 409 ){
                    this.setState({errorMessage: <ErrorMessage message={response.json().message}/>});
                }
            })
        }

    }

    render() {
        return (
            <form className="register-form">
                {this.state.usernameInput}
                {this.state.passwordInput}
                {this.state.repeatPasswordInput}
                {this.state.submitButton}
                {this.state.errorMessage}
            </form>
        );
    }


}

class TextInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: "", placeholder: props.placeholder};
    }

    render() {
        return (
            <input className="text-input" type="text" placeholder={this.state.placeholder} onChange={event => this.setState({value: event.target.value})}/>
        );
    }

    getValue(){
        return this.state.value;
    }
}

class PasswordInput extends TextInput{
    constructor(props) {
        super(props);
    }

    render(){
        return (
            <input className="text-input" type="password" placeholder={this.state.placeholder} onChange={event => this.setState({value: event.target.value})}/>
        );
    }
}

class Button extends React.Component {
    constructor(props) {
        super(props);
        this.state = {label: props.label, onClick: props.onClick}
    }

    render() {
        return (
            <button className="button" onClick={this.state.onClick}>{this.state.label}</button>
        )
    }
}

class ErrorMessage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {message: props.message}
    }

    render(){
        return (
            <div>{this.state.message}</div>
        );
    }
}

ReactDOM.render(<App/>, document.querySelector("#app"));

