cmake_minimum_required(VERSION 3.16)

project(Projector VERSION 0.0.1)

file(GLOB src 
    src/*.cpp
    src/**/*.cpp
    src/**/**/*.cpp
    src/**/**/**/*.cpp
    src/**/**/**/**/*.cpp
    src/**/**/**/**/**/*.cpp
)

add_executable(Projector ${src})

target_include_directories(Projector PUBLIC src/external)