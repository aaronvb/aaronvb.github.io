---
title: Rails Inspired Logging in Go
date: "2021-01-18"
template: "post"
comments: true
description: "Verbose logging in development is one of the few things I miss about Ruby on Rails. I made two libraries to bring that to Go and explain how to set that up with middleware."
slug: "rails-inspired-logging-in-go"
category: "Open Source"
tags:
  - "Code"
  - "Rails"
  - "Go"
  - "Logging"
  - "Middleware"
---

One of the few things I miss from [Ruby on Rails](https://rubyonrails.org) is the verbose logging the framework provides to you in development. If you're not coming from Ruby on Rails I believe this will still be applicable and beneficial to your development in Go. 

Before we jump into the details, I'd like to preface this by saying this guide to logging is meant to be used in the **development** environment. While I think logging should be done in production as well, the depth of logging should be limited in any production environment where we need to take security into account. (Side note: The param logging package I've released will automatically filter passwords.)

### The Rails Log
Below is an example of a standard log output by Rails.

```
Started GET "/users?foo=bar" for ::1 at 2021-01-18 22:16:58 -1000
Processing by UsersController#index as HTML
  Parameters: {"foo"=>"bar"}
  User Load (0.2ms)  SELECT "users".* FROM "users" ORDER BY "users"."id" ASC LIMIT ?  [["LIMIT", 1]]
  ↳ app/controllers/users_controller.rb:3:in `index'
Completed 200 OK in 4ms (Views: 0.7ms | ActiveRecord: 0.2ms | Allocations: 973)
```

Breaking it down we start with the method used in the request, followed by the path and a timestamp.

```
Started GET "/users?foo=bar" for ::1 at 2021-01-18 22:16:58 -1000
```

Next we have the parameters passed to the request.

```
Parameters: {"foo"=>"bar"}
```

After that we have any queries processed during the request and the line where the query was run.

```
User Load (0.2ms)  SELECT "users".* FROM "users" ORDER BY "users"."id" ASC LIMIT ?  [["LIMIT", 1]]
  ↳ app/controllers/users_controller.rb:3:in `index'
```

And the last line is the end of the request that contains the response status and time to completion.

```
Completed 200 OK in 4ms (Views: 0.7ms | ActiveRecord: 0.2ms | Allocations: 973)
```

As you can see, all of these together provide very helpful details into every request.

### The Go Log
Out of the box Go won't give you that kind of logging for web requests. 

Enter [logrequest](https://github.com/aaronvb/logrequest) and [logparams](https://github.com/aaronvb/logparams). I wrote these two packages to bring the above logging to your Go project. With one exception, the SQL query logging has to be handled manually, but no worries I'll explain how I handle that at the end.

```
app_1      | Started GET "/" 172.19.0.1:64368 HTTP/1.1 at 2021-01-19 08:30:08
app_1      |    SELECT id, name, email, created, active FROM users WHERE id = $1 [8]
app_1      |    ↳ /app/pkg/models/postgres/users.go:75
app_1      | Completed 200 in 2.1124ms
```

#### Middleware 
To get [logrequest](https://github.com/aaronvb/logrequest) and [logparams](https://github.com/aaronvb/logparams) working, we'll need to use it as middleware within the http request. If you're not familiar with middleware, Alex Edwards has a great blog post covering it: [https://www.alexedwards.net/blog/making-and-using-middleware](https://www.alexedwards.net/blog/making-and-using-middleware).

And we'll be using [gorilla/mux](https://github.com/gorilla/mux) to handle the middleware.

#### Using logrequest and logparams
Below is an example application which I'll break down.

```go
package main

import (
    "fmt"
    "log"
    "net/http"
    "os"

    "github.com/aaronvb/logparams"
    "github.com/aaronvb/logrequest"

    "github.com/gorilla/mux"
)

type application struct {
    errorLog *log.Logger
    infoLog  *log.Logger
}

func main() {
    infoLog := log.New(os.Stdout, "INFO\t", log.Ldate|log.Ltime)
    errorLog := log.New(os.Stderr, "ERROR\t", log.Ldate|log.Ltime|log.Lshortfile)

    app := &application{
        errorLog: errorLog,
        infoLog:  infoLog,
    }

    srv := &http.Server{
        Addr:     ":8080",
        ErrorLog: errorLog,
        Handler:  app.routes(),
    }

    infoLog.Printf("Starting server on %s", ":8080")
    err := srv.ListenAndServe()
    errorLog.Fatal(err)
}

func (app *application) routes() http.Handler {
    r := mux.NewRouter()
    r.HandleFunc("/foobar", app.foobar).Methods("POST")

    // Middleware
    r.Use(app.logRequest)
    r.Use(app.logParams)

    return r
}

func (app *application) foobar(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, "Hello world")
}

// Middleware

func (app *application) logRequest(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        lr := logrequest.LogRequest{Request: r, Writer: w, Handler: next, NewLine: 2, Timestamp: true}
        lr.ToLogger(app.infoLog)
    })
}

func (app *application) logParams(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        lp := logparams.LogParams{Request: r}
        lp.ToLogger(app.infoLog)
        next.ServeHTTP(w, r)
    })
}
```

First we need to make sure we create the log outputs and pass it to the application struct. These will be used by logrequest and logparam. Alternatively, you can have either package return a string instead of printing to a log output.

```go
infoLog := log.New(os.Stdout, "INFO\t", log.Ldate|log.Ltime)
errorLog := log.New(os.Stderr, "ERROR\t", log.Ldate|log.Ltime|log.Lshortfile)

app := &application{
    errorLog: errorLog,
    infoLog:  infoLog,
}
```

In the `routes` function, which we use as the `Handler`, we create a new mux router and pass the two middleware functions to it. Both of those middleware functions will use the libraries.

```go
func (app *application) routes() http.Handler {
    r := mux.NewRouter()
    r.HandleFunc("/foobar", app.foobar).Methods("POST")

    // Middleware
    r.Use(app.logRequest)
    r.Use(app.logParams)

    return r
}
```

The `logRequest` middleware function creates a new logrequest struct where we pass the http `Request`, `Writer`, `Handler`, and two optional arguments to configure the output. The reason why we pass the `Handler` is so that we can hook into the end of the request to show the response status and total time for the request.

`Timestamp` (boolean) can be used to hide/show the timestamp at the start of the request. (`Started GET "/" 172.19.0.1:64368 HTTP/1.1 at 2021-01-19 08:30:08`)

`NewLine` (int) can be used to add line breaks between each request log output(Rails does this by default).

We call `ToLogger` on the struct to print the request to the logger we created above.

Note: We don't need to call `next` like you would normally do with middleware -- logrequest package will call this automatically.

```go
func (app *application) logRequest(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        lp := logrequest.LogRequest{Request: r, Writer: w, Handler: next, NewLine: 2, Timestamp: true}
        lp.ToLogger(app.infoLog)
    })
}
```

The `logParams` middleware function creates a new logparams struct where we pass just the `Request`. 

By default logparams will filter out `password` and `password_confirmation` params. This can be turned off by passing `ShowPassword: True` (do NOT recommend this).

Also by default, logparams will hide empty parameters. This can be turned off by passing `ShowEmpty: true`.

We call `ToLogger` on the struct to print the params to the logger we created above. 

```go
func (app *application) logParams(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        lp := logparams.LogParams{Request: r}
        lp.ToLogger(app.infoLog)
        next.ServeHTTP(w, r)
    })
}
```

#### SQL Query Logging
The final part of this is going to be subjective based on how you've structured your application. In my latest project the structure was influenced by [Alex Edwards Let's Go!](https://lets-go.alexedwards.net) book, which is a great dive into building a web application in Go. If you've read that, or use a similar structure, this should be easy to apply.

In the `main.go` we'll need to create a new log output, and pass that to the application model struct. In this example that's going to be a User. We're going to use this log output in the model to print the query.

Note: `postgres` is a custom postgres package(ORM), that the models belong to and is not related to any official package.

```go
requestLog := log.New(os.Stdout, "", 0)

...

app := &application{
    errorLog:   errorLog,
    infoLog:    infoLog,
    requestLog: requestLog,
    session:    session,
    users: &postgres.UserModel{
        AppModels: postgres.AppModels{
            DB:  db,
            Log: requestLog,
        },
    },
}
```

In my custom `postgres` package I've created functions that wrap the `database/sql` query functions which will be used to print to the log output and execute the query.

The line `_, file, line, _ := runtime.Caller(1)` is what we use to print the file and line number that is calling the function.

```go
// Package postgres is the ORM for the db
package postgres

import (
    "database/sql"
    "log"
    "runtime"
)

// AppModels is the struct that shares the functions between
// each model. Requires DB and Log.
type AppModels struct {
    DB  *sql.DB
    Log *log.Logger
}

func (m *AppModels) queryRow(query string, args ...interface{}) *sql.Row {
    m.Log.Printf("\t\u001b[34;1m%s \u001b[0m%v", query, args)
    _, file, line, _ := runtime.Caller(1)
    m.Log.Printf("\t\u21B3 %s:%d", file, line)
    return m.DB.QueryRow(query, args...)
}

func (m *AppModels) query(query string) (*sql.Rows, error) {
    m.Log.Printf("\t\u001b[34;1m%s", query)
    _, file, line, _ := runtime.Caller(1)
    m.Log.Printf("\t\u21B3 %s:%d", file, line)
    row, err := m.DB.Query(query)
    return row, err
}

func (m *AppModels) exec(query string, args ...interface{}) error {
    m.Log.Printf("\t\u001b[34;1m%s \u001b[0m%v", query, args)
    _, file, line, _ := runtime.Caller(1)
    m.Log.Printf("\t\u21B3 %s:%d", file, line)

    _, err := m.DB.Exec(query, args...)
    return err
}
```

And now we can use the above functions in the models to do things like find a User.

```go
package postgres

type UserModel struct {
    AppModels
}

func (m *UserModel) Find(id int) (*models.User, error) {
    u := &models.User{}

    stmt := `SELECT id FROM users WHERE id = $1`
    row := m.queryRow(stmt, id)
    err := row.Scan(&u.ID)
    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return nil, models.ErrNoRecord
        } else {
            return nil, err
        }
    }

    return u, nil
}
```

I hope that helps you get started with some awesome Rails inspired logging. There's quite a lot going on in this blog post so please comment below or contact me if you have any questions.
