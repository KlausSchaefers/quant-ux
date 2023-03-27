export const html1 = `
<!DOCTYPE html>
<html>
<head>
	<title>Login Form</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style>
		body {
			font-family: Arial, sans-serif;
			background-color: #f2f2f2;
		}
		
		.container {
			background-color: #fff;
			padding: 20px;
			border-radius: 10px;
			box-shadow: 0px 0px 10px #888888;
			margin-top: 50px;
			max-width: 400px;
			margin-left: auto;
			margin-right: auto;
		}
		
		input[type=text], input[type=password] {
			width: 100%;
			padding: 10px;
			margin: 5px 0 22px 0;
			display: inline-block;
			border: none;
			background: #f2f2f2;
			border-radius: 5px;
		}
		
		input[type=text]:focus, input[type=password]:focus {
			background-color: #ddd;
			outline: none;
		}
		
		hr {
			border: 1px solid #f1f1f1;
			margin-bottom: 25px;
		}
		
		button[type=submit] {
			background-color: #4CAF50;
			color: white;
			padding: 10px 20px;
			border: none;
			border-radius: 5px;
			cursor: pointer;
			width: 100%;
			margin-bottom:10px;
		}
		
		button[type=submit]:hover {
			opacity: 0.8;
		}
		
		.cancelbtn {
			background-color: #f44336;
			color: white;
			padding: 10px 20px;
			border: none;
			border-radius: 5px;
			cursor: pointer;
			width: 100%;
			margin-bottom:10px;
		}
		
		.cancelbtn:hover {
			opacity: 0.8;
		}
		
		.container a {
			color: dodgerblue;
		}
		
		span.psw {
			float: right;
			padding-top: 16px;
		}
	</style>
</head>
<body>

	<form action="/action_page.php">
		<div class="container">
			<h1>Login</h1>
			<p>Please fill in this form to access your account.</p>
			<hr>
			
			<label for="username"><b>Username</b></label>
			<input type="text" placeholder="Enter Username" name="username" required>
			
			<label for="password"><b>Password</b></label>
			<input type="password" placeholder="Enter Password" name="password" required>
			
			<button type="submit">Login</button>
			<label>
				<input type="checkbox" checked="checked" name="remember"> Remember me
			</label>
		</div>

		<div class="container" style="background-color:#f1f1f1">
			<button type="button" class="cancelbtn">Cancel</button>
			<span class="psw">Forgot <a href="#">password?</a></span>
		</div>
	</form>

</body>
</html>
`

export const html2 = `

<!DOCTYPE html>
<html>
<head>
	<title>Login Form</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style>
		body {
			font-family: Arial, sans-serif;
			background-color: #f2f2f2;
		}

		button {
			border: 1px solid black;
			background:yellow
		}
		button:hover {
			background:red;
		}

		div {
			margin-bottom:10px;
			padding:10px
		}

		input{
			border: 1px solid red;
		}

		img {
			height:100px;
			width:100px;
		}

		select {
			padding:5px;
			border:1px solid orange;
			width: 100px
		}

		.orange {
			background:orange;
			color: white
		}
	</style>
</head>
<body>

	<img />



	<div>
		<label>
			<input type="checkbox" checked="checked" name="remember"> Remember me
		</label>

		<label>
			<input type="checkbox" checked name="remember"> Remember me
		</label>

		<label>
			<input type="checkbox" name="remember"> Not checked
		</label>

		</div>

	
	<div>
	<label>
		<input type="radio" checked="checked" name="radio "> AAA
	</label>

	<label>
		<input type="radio" checked="" name="radio "> BBB
	</label>
	</div>


	<div>
		<select id="cars">
			<option value="volvo">Volvo</option>
			<option value="saab">Saab</option>
			<option value="opel">Opel</option>
			<option value="audi">Audi</option>
		</select>

	</div>

	<div>
		<select class="orange">
			<option value="volvo">Volvo</option>
			<option value="saab">Saab</option>
			<option value="opel">Opel</option>
			<option value="audi">Audi</option>
		</select>

	</div>





	<div>
	<label for="password"><b>Password</b></label>
	<input type="password" placeholder="Enter Password" name="password" required>
</div>
	
		<label for="username"><b>Username</b> <i>italice</i></label>

	
	<div>
		<label for="lastname"><b>Lastname</b> (Name of father)</label>
	</div>

	<div>
		<button>Click</button>
	</div>

	<button>Click2</button>
	<input type="submit" value="Login">
	<input type="reset" value="Reset">
	

</body>
</html>
`

export const html3 = `
<html>

<head>
	<title>Login Page</title>
	<!-- Adding custom styles -->
	<style type="text/css">
		.btn{
			background-color: red;
			color: white;
			padding: 10px;
			border: none;
			margin: 10px;
			border-radius: 10px;
			cursor: pointer;
		}
		.forgot-password{
			color: blue;
			margin: 10px;
		}
	</style>
</head>
<body>
	<!-- Login Form -->
	<form>
		<label>Username: </label>
		<input type="text"><br>
		<label>Password: </label>
		<input type="password"><br>
		<input type="submit" value="Login" class="btn">
	</form>
	<!-- Forget Password Link -->
	<a href="#" class="forgot-password">Forgot Password?</a>
</body>
`


export const html4 = `
<html>

<head>
	<title>Login Page</title>
	<style>
		body {
			background-color: #eee;
			font-family: Arial, Helvetica, sans-serif;
		}
		h1 {
			text-align: center;
		}
		form {
			margin: 50px auto;
			background-color: #fff;
			padding: 20px;
			width: 400px;
			box-shadow: 0px 2px 10px rgba(0,0,0,0.3);
			border-radius: 5px;
		}
		input[type="text"],
		input[type="password"] {
			display: block;
			margin: 10px 0;
			padding: 10px;
			width: 100%;
			border-radius: 5px;
			border: none;
			box-shadow: 0px 2px 10px rgba(0,0,0,0.3);
		}
		input[type="submit"],
		a {
			font-weight: bold;
			color: #fff;
			background-color: red;
			padding: 10px 20px;
			border: none;
			border-radius: 5px;
			text-decoration: none;
			display: inline-block;
			margin: 10px 0;
			cursor: pointer;
		}
		input[type="submit"]:hover,
		a:hover {
			background-color: #FF2E2E;
		}
		input[type="checkbox"] {
			margin-right: 10px;
		}
		label {
			display: inline;
			font-size: 16px;
			font-weight: bold;
			margin: 10px 0;
		}
	</style>
</head>
<body>
	<h1>Login Page</h1>
	<form>
		<label for="username">Username:</label>
		<input type="text" id="username" name="username" placeholder="Enter your username">
		<label for="password">Password:</label>
		<input type="password" id="password" name="password" placeholder="Enter your password">
		
		<input type="submit" value="Login">
		<a href="#">Forget Password?</a>
	</form>
</body>`


export const html5 = `
<html>

  <head>
    <title>Login Page</title>
    <style>
      input[type="text"], input[type="password"] {
        width: 100%;
        padding: 12px 20px;
        margin: 8px 0;
        display: inline-block;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
      }
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: bold;
      }
      button {
        background-color: red;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        padding: 12px 20px;
        margin-top: 10px;
      }
      button:hover {
        opacity: 0.8;
      }
      a {
        color: red;
        text-decoration: none;
      }
      form {
        margin: 0 auto;
        padding: 50px;
        width: 400px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      h2 {
        text-align: center;
      }
    </style>
  </head>
  <body>
    <h2>Login Page</h2>
    <form>
      <label for="username">Username:</label>
      <input type="text" id="username" name="username" placeholder="Enter your username">
      <label for="password">Password:</label>
      <input type="password" id="password" name="password" placeholder="Enter your password">
      <button type="submit">Login</button>
      <a href="#">Forget password?</a>
    </form>
  </body>
</html>`


export const html6 = `
<html>

<head>
	<title>Login Page</title>
	<style>
		body {
			font-family: Arial, sans-serif;
			background-color: #f2f2f2;
		}
		h1 {
			text-align: center;
			color: #555;
		}
		form {
			max-width: 400px;
			margin: 0 auto;
			padding: 20px;
			background-color: #fff;
			border-radius: 5px;
			box-shadow: 0 0 10px rgba(0,0,0,0.3);
		}
		input[type=text], input[type=password] {
			width: 100%;
			padding: 12px 20px;
			margin: 8px 0;
			display: inline-block;
			border: 1px solid #ccc;
			border-radius: 4px;
			box-sizing: border-box;
		}
		button {
			background-color: red;
			color: #fff;
			padding: 14px 20px;
			margin: 8px 0;
			border: none;
			border-radius: 4px;
			cursor: pointer;
		}
		button:hover {
			background-color: #d70000;
		}
		a {
			color: #555;
			text-decoration: none;
		}
	</style>
</head>
<body>
	<h1>Login Page</h1>
	<form>
		<label for="username">Username:</label>
		<input type="text" id="username" name="username" required>

		<label for="password">Password:</label>
		<input type="password" id="password" name="password" required>

		<button type="submit">Login</button>
	</form>
	<p>Forgot your password? <a href="#">Reset it here</a>.</p>
</body>
</html>`



export const html7 = `
<html>

<head>
	<title>Login Page</title>
	<style>
		body {
			font-family: Arial, sans-serif;
			background-color: #f2f2f2;
		}

		.red th{
			background:red;
			color:#fff
		}

		.green {
			border-collapse: collapse;
			border-spacing: 0;
			color: green
		}

		.green th, .green td{
			border:1px solid green;
			padding:10px
		}
		.green thead{
			background:green;
			color:black
			
		}

		.blue .header{
			background:blue;
			color:#fff
		}
	</style>
</head>
<body>
	<h1>Table Page</h1>
	
	<table class="red">
		<tr>
			<th>Person 1</th>
			<th>Person 2</th>
			<th>Person 3</th>
		</tr>
		<tr>
			<td>Emil</td>
			<td>Tobias</td>
			<td>Linus</td>
		</tr>
		<tr>
			<td>16</td>
			<td>14</td>
			<td>10</td>
		</tr>
		</table>


		<table class="blue">
		<tr class="header">
			<th>Person 1</th>
			<th>Person 2</th>
			<th>Person 3</th>
		</tr>
		<tr>
			<td>Emil</td>
			<td>Tobias</td>
			<td>Linus</td>
		</tr>
		<tr>
			<td>16</td>
			<td>14</td>
			<td>10</td>
		</tr>
		</table>


		<table class="green">
  <thead>
    <tr>
      <th>Month</th>
      <th>Savings</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>January</td>
      <td>$100</td>
    </tr>
    <tr>
      <td>February</td>
      <td>$80</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td>Sum</td>
      <td>$180</td>
    </tr>
  </tfoot>
</table>

<html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>User table</title>
</head>
<body>
    <h1>List of Users</h1>
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Date of birth</th>
                <th>Job</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>John Doe</td>
                <td>01/01/1990</td>
                <td>Web Developer</td>
            </tr>
            <tr>
                <td>Jane Smith</td>
                <td>04/15/1985</td>
                <td>Graphic Designer</td>
            </tr>
            <tr>
                <td>James Johnson</td>
                <td>11/25/1978</td>
                <td>Project Manager</td>
            </tr>
        </tbody>
    </table>
</body>
</html>

</body>
</html>`


export const html8 = `
<html>

<head>
	<title>Login Page</title>
	<style>
		body {
			font-family: Arial, sans-serif;
			background-color: #f2f2f2;
		}

		div {
			outline: solid blue;
			padding:20px
		}

		.border{
			border:1px solid red;
	
			outline: none;
		}

		.opac {
			opacity:0;
			border:1px solid yellow
		}


	
	</style>
</head>
<body>
	<h1>Remove invisible Page</h1>

	<div class="border">

		<div class="invisble">

		<div class="invisble">

			<div class="border">
				<button>Click</button>
			</div>

		</div>

		</div>

	
	</div>

	<div class="opac">
		Should not be seen

	<div>
	

</body>
</html>`

export const html9 = `
<html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login Page</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: sans-serif;
        }

        .container {
            width: 100%;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #F2F2F2;
        }

        .login-box {
            width: 320px;
            padding: 40px;
            border-radius: 10px;
            background-color: #fff;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }

        .login-box h2 {
            font-size: 24px;
            font-weight: 500;
            margin: 0 0 20px 0;
            text-align: center;
        }

        .login-box label {
            display: block;
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 10px;
        }

        .login-box input[type="email"],
        .login-box input[type="password"] {
            width: 100%;
            font-size: 16px;
            padding: 10px;
            border: none;
            border-radius: 5px;
            background-color: #F5F5F5;
        }

        .login-box input[type="submit"] {
            width: 100%;
            margin-top: 20px;
            font-size: 16px;
            font-weight: 500;
            padding: 10px;
            border: none;
            border-radius: 5px;
            color: #fff;
            background-color: #ff0000;
            cursor: pointer;
        }

        .login-box a {
            display: block;
            font-size: 14px;
            text-align: center;
            margin-top: 20px;
            color: #333;
        }

        .login-box a:hover {
            color: #ff0000;
            text-decoration: underline;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="login-box">
        <h2>Login</h2>
        <form>
            <label for="email">Email</label>
            <input type="email" name="email" id="email" required>

            <label for="password">Password</label>
            <input type="password" name="password" id="password" required>

            <input type="submit" value="Login">

            <a href="#">Forget Password?</a>
        </form>
    </div>
</div>
</body>
</html>`


export const html10 = `
	<html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>Login Page</title>
		<style>
			body {
				margin: 0;
				padding: 0;
				font-family: sans-serif;
			}

			.container {
				width: 100%;
				height: 100vh;
				display: flex;
				justify-content: center;
				align-items: center;
				background-color: #F2F2F2;
			}

			.login-box {
				width: 320px;
				padding: 40px;
				border-radius: 10px;
				background-color: #fff;
				box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
			}

			.login-box h2 {
				font-size: 24px;
				font-weight: 500;
				margin: 0 0 20px 0;
				text-align: center;
			}

			.login-box label {
				display: block;
				font-size: 16px;
				font-weight: 500;	
			}

			.login-box input[type="email"],
			.login-box input[type="password"] {
				width: 100%;
				font-size: 16px;
				padding: 10px;
				border: none;
				border-radius: 5px;
				background-color: #F5F5F5;
			}

			.login-box input[type="submit"] {
				width: 100%;		
				font-size: 16px;
				font-weight: 500;
				padding: 10px;
				border: none;
				border-radius: 5px;
				color: #fff;
				background-color: #ff0000;
				cursor: pointer;
			}

			.login-box a {
				display: block;
				font-size: 14px;
				text-align: center;		
				color: #333;
			}

			.login-box a:hover {
				color: #ff0000;
				text-decoration: underline;
			}
		</style>
	</head>
	<body>
	<div class="container">
		<div class="login-box">
			<h2>Login</h2>
			<form>
				<label for="email">Email</label>
				<input type="email" name="email" id="email" required>

				<label for="password">Password</label>
				<input type="password" name="password" id="password" required>

				<input type="submit" value="Login">

				<a href="#">Forget Password?</a>
			</form>
		</div>
	</div>
	</body>
</html>`

export const html11 = `
<html>

  <head>
    <title>Cooking App - Welcome</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <header>
      <h1>Welcome to the Cooking App</h1>
      <nav>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">Recipes</a></li>
          <li><a href="#">Search</a></li>
        </ul>
      </nav>
    </header>
    
    <main>
      <section>
        <h2>About the App</h2>
        <p>Our cooking app is your go-to source for delicious recipes and meal ideas. Browse our collection of recipes, discover new ingredients and cooking techniques, and create your own recipe collections for easy access.</p>
      </section>
      
      <section>
        <h2>Featured Recipes</h2>
        <ul>
          <li><a href="#">Spaghetti and Meatballs</a></li>
          <li><a href="#">Chocolate Cake</a></li>
          <li><a href="#">Grilled Chicken Sandwich</a></li>
        </ul>
      </section>
      
      <section>
        <h2>Testimonials</h2>
        <p>"This app has revolutionized the way I cook!" - Jane</p>
        <p>"I use this app every day and have learned so much!" - Tom</p>
      </section>
    </main>
    
    <footer>
      <p>&copy; 2021 Cooking App</p>
    </footer>
  </body>
</html>`