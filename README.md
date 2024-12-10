# Go Doc Comments

[English](#english) | [中文](#中文)

## English

A VSCode extension (or IDE based on VSCode) that helps developers efficiently add standard documentation comments to Golang code.

## 中文

这是一个用于VSCode（或基于其开发的IDE）的扩展，用于在开发Golang程序时，便捷地为代码添加标准的文档注释。

## Features/功能

- Generate standard doc comments for:
  - Package declarations
  - Functions and methods
  - Types
  - Interface methods
- Support various parameter types:
  - Multiple parameters of the same type
  - Variadic parameters
  - Named and unnamed return values

## Usage/使用

1. Place your cursor on the line above where you want to add a documentation comment
2. Press `Cmd+Ctrl+/` (Mac) or use command palette to run "Generate Go Doc Comment"

## Examples/示例

```go
// Package main
package main

// HelloWorld
//
// Returns:
//   - string
func HelloWorld() string {
    return "Hello, World!"
}

// User
type User struct {
    Name string
    Age  int
}

// SetArg
//
// Parameters:
//   - name string
//   - age int
//
// Returns:
//   - r1 string
//   - r2 error
//   - usr *User
func (u *User) SetArg(name string, age int) (r1 string, r2 error, usr *User) {
    return
}

// CheckWrite 展示函数类型的返回值
//
// Returns:
//   - func() int
//   - func(in string, out chan int) (int, error)
func (u *User) CheckWrite() (func() int, func(in string, out chan int) (int, error)) {
    return nil, nil
}

// Test 展示 map 类型返回值
//
// Returns:
//   - map[string]string
func (u *User) Test() map[string]string {
    return nil
}

// Test1 展示多返回值
//
// Returns:
//   - map[string]string
//   - []bson.M
func (u *User) Test1() (map[string]string, []bson.M) {
    return nil, nil
}

// Test2 展示 channel 类型返回值
//
// Returns:
//   - chan string
func (u *User) Test2() chan string {
    return nil
}

// Test3 展示混合类型返回值
//
// Returns:
//   - chan string
//   - []bson.M
func (u *User) Test3() (chan string, []bson.M) {
    return nil, nil
}

// Test4 展示命名返回值
//
// Returns:
//   - c1 chan string
//   - c2 chan string
//   - b1 []bson.M
func (u *User) Test4() (c1, c2 chan string, b1 []bson.M) {
    return
}

// Test5 展示可变参数
//
// Parameters:
//   - arg ...int
func (u *User) Test5(arg ...int) {
}

// Test6 展示混合可变参数
//
// Parameters:
//   - arg1 int
//   - arg2 ...int
func (u *User) Test6(arg1 int, arg2 ...int) {
}

// Test7 展示基本参数
//
// Parameters:
//   - arg1 int
//   - arg2 int
func (u *User) Test7(arg1 int, arg2 int) {
}

// Test8 展示参数和返回值共享类型
//
// Parameters:
//   - arg1 int
//   - arg2 int
//
// Returns:
//   - ret1 int
//   - ret2 int
func (u *User) Test8(arg1, arg2 int) (ret1, ret2 int) {
    return
}

// Test9 展示函数类型返回值和 context 参数
//
// Parameters:
//   - arg1 int
//   - arg2 int
//   - ctx context.Context
//
// Returns:
//   - t1 func() error
//   - t2 func() int
func (u *User) Test9(arg1, arg2 int, ctx context.Context) (t1 func() error, t2 func() int) {
    return
}

// ITest
type ITest interface {
    // Tf1
    //
    // Parameters:
    //   - name string
    //   - typ string
    //
    // Returns:
    //   - r1 string
    //   - r2 error
    //   - usr *User
    Tf1(name, typ string) (r1 string, r2 error, usr *User)

    // Tf2
    //
    // Parameters:
    //   - arg ...int
    //
    // Returns:
    //   - string
    //   - int
    Tf2(arg ...int) (string, int)
}
```

## Keyboard Shortcuts/快捷键

Default/默认:
- Mac: `Cmd+Ctrl+/`

You can customize the keyboard shortcut in VSCode's keyboard shortcuts settings (Cmd+K Cmd+S).

您可以在 VSCode 的键盘快捷方式设置中自定义快捷键（Cmd+K Cmd+S）。

## Development

1. Clone the repository
2. Run `npm install`
3. Open in VSCode
4. Press F5 to start debugging
