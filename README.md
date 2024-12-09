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
