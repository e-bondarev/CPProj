const cmake =
`cmake_minimum_required(VERSION 3.16)

set(PROJECTOR_PROJECT_NAME PARAM_PROJECTOR_PROJECT_NAME)
set(PROJECTOR_APP_NAME     PARAM_PROJECTOR_APP_NAME)

project(\${PROJECTOR_PROJECT_NAME} VERSION 0.0.1)

file(GLOB src 
    src/*.cpp
    src/**/*.cpp
    src/**/**/*.cpp
    src/**/**/**/*.cpp
    src/**/**/**/**/*.cpp
    src/**/**/**/**/**/*.cpp
)

add_executable(\${PROJECTOR_APP_NAME} \${src})

target_include_directories(\${PROJECTOR_APP_NAME} PUBLIC src)
target_precompile_headers(\${PROJECTOR_APP_NAME} PUBLIC src/pch.h)
`;

const main = 
`int main()
{
    DEBUG_LOG_OUT("Debug mode!");
    LOG_OUT("Hello, world!");

    return 0;
}
`;

const pch = 
`#pragma once

#include <iostream>

#include <vector>
#include <memory>
#include <string>
#include <map>

#ifdef NDEBUG
#   define PROJECTOR_RELEASE
#else
#   define PROJECTOR_DEBUG
#endif

#define LOG_OUT(x) std::cout << x << '\\n'

// This macro doesn't create any assembly code.
#define EMPTY_MACRO ((void)0)

#ifdef PROJECTOR_DEBUG
#   define DEBUG_LOG_OUT(x) LOG_OUT(x)
#else
#   define DEBUG_LOG_OUT(x) EMPTY_MACRO
#endif
`;

const gitignore = 
`build
Build
out
.vscode
.vs
`

module.exports = {
    cmake,
    main,
    pch,
    gitignore
};