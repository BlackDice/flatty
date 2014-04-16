#include <node.h>
#include "engine.h"

using namespace v8;

Handle<Value> CreateObject(const Arguments& args) {
  HandleScope scope;
  return scope.Close(engine::NewInstance(args));
}

void InitAll(Handle<Object> exports, Handle<Object> module) {
  engine::Init();

  module->Set(String::NewSymbol("exports"),
      FunctionTemplate::New(CreateObject)->GetFunction());
}

NODE_MODULE(flatty, InitAll)
