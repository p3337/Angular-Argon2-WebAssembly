cmake_minimum_required(VERSION 2.8)

project(agron2)

add_definitions(-DARGON2_JS)

set(ARCHIVE_OUTPUT_DIRECTORY generated)
set(LIBRARY_OUTPUT_DIRECTORY generated)
set(RUNTIME_OUTPUT_DIRECTORY generated)
set(EXECUTABLE_OUTPUT_PATH generated)

include_directories(argon2/include)

set(sources
    argon2/src/blake2/blake2b.c

    argon2/src/argon2.c
    argon2/src/core.c
    argon2/src/encoding.c
    argon2/src/ref.c
    argon2/src/thread.c
)

set(target argon2)
add_executable(${target} ${sources})


set(ARGON2_LINKER_FLAGS "-O3")
string(APPEND ARGON2_LINKER_FLAGS " -g0")
string(APPEND ARGON2_LINKER_FLAGS " --memory-init-file 0")
string(APPEND ARGON2_LINKER_FLAGS " -s FILESYSTEM=0")
string(APPEND ARGON2_LINKER_FLAGS " -s EXPORTED_FUNCTIONS=[\"_argon2_hash\",\"_argon2_verify\",\"_argon2_error_message\",\"_malloc\",\"_free\"]")
string(APPEND ARGON2_LINKER_FLAGS " -s EXTRA_EXPORTED_RUNTIME_METHODS=[\"UTF8ToString\",\"allocate\",\"ALLOC_NORMAL\"]")
string(APPEND ARGON2_LINKER_FLAGS " -s DEMANGLE_SUPPORT=0")
string(APPEND ARGON2_LINKER_FLAGS " -s ASSERTIONS=0")
string(APPEND ARGON2_LINKER_FLAGS " -s NO_EXIT_RUNTIME=1")
string(APPEND ARGON2_LINKER_FLAGS " -s TOTAL_MEMORY=16MB")
string(APPEND ARGON2_LINKER_FLAGS " -s BINARYEN_MEM_MAX=2147418112")
string(APPEND ARGON2_LINKER_FLAGS " -s ALLOW_MEMORY_GROWTH=1")
string(APPEND ARGON2_LINKER_FLAGS " -s WASM=1")                       # generate wasm file
string(APPEND ARGON2_LINKER_FLAGS " -s MODULARIZE=1")                 # generate module
string(APPEND ARGON2_LINKER_FLAGS " -s ENVIRONMENT=web")              # build for web only

set_target_properties(
    ${target}
    PROPERTIES
        OUTPUT_NAME ${target}
        LINK_FLAGS ${ARGON2_LINKER_FLAGS}
)
