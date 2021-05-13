#pragma once

#include <string>
#include <vector>
#include <memory>
#include <map>

#include <iostream>

#define LOG_OUT(x) std::cout << x << '\n'

#ifdef _NDEBUG
#   define P_RELEASE
#else
#   define P_DEBUG
#endif