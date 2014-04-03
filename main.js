var fs = require("fs");
var path = require("path");
var rand = require("generate-key");

function engine(file, options) {
  if(!options) {
    options = {};
  }
  this.file = file;
  if(!fs.existsSync(this.file)) {
    fs.writeFileSync(this.file, "{}");
  }
  if(path.extname(this.file) === ".json") {
    this.data = JSON.parse(fs.readFileSync(this.file));
  } else {
    this.data = this.parse(fs.readFileSync(this.file));
  }
  this.ticker();
  this.changes = 0;
  this.tickInterval = options.interval || 50;
}

engine.prototype.get = function(key, callback) {
  if('function' == typeof key) {
    callback = key;
    key = null;
  }
  if(this.data[key] && 'object' == typeof this.data[key] || key === null) {
    if(key === null) {
      arr = [];
      data = this.data;
      for(var i in data) {
        data[i].id = i;
        arr.push(data[i]);
      }
      callback && callback(arr);
      delete data;
    } else {
      callback && callback(this.data[key]);
    }
  } else {
    callback && callback(null);
  }
}

engine.prototype.set = function(key, data, callback) {
  if('function' == typeof data) {
    callback = data;
    data = key;
    key = rand.generateKey();
  }
  if(this.data[key] && 'object' == typeof this.data[key]) {
    this.update(key, data, callback);
    return;
  }
  this.data[key] = data;
  callback && callback(key);
  this.changes++;
}

engine.prototype.update = function(key, data, callback) {
  for(var i in data) {
    this.data[key][i] = data[i];
  }
  callback && callback(key);
  this.changes++;
}

engine.prototype.delete = function(key, callback) {
  if(this.data[key] && 'object' == typeof this.data[key]) {
    this.data[key] = null;
    delete this.data[key];
  }
  callback && callback();
  this.changes++;
}

engine.prototype.find = function(obj, callback) {
  ret = [];
  for(var i in this.data) {
    matches = 0;
    for(var e in obj) {
      if(this.data[i][e] == obj[e]) {
        matches++;
      }
    }
    if(matches === Object.keys(obj).length) {
      dat = this.data[i];
      dat.id = i;
      ret.push(dat);
    }
  }
  callback && callback(ret);
}

engine.prototype.ticker = function() {
  this.locked = false;
  this.tick = setInterval(function() {
    if(this.locked || this.changes == 0) {
      return;
    }
    this.locked = true;
    fs.writeFile(this.file, this.stringify(this.data), function(err) {
      if(err) {
        throw new Error(err);
      }
      this.locked = false;
      this.changes = 0;
    }.bind(this));
  }.bind(this), this.interval);
  this.tick.unref();
}

engine.prototype.stringify  = function(data, callback) {
  processed = "";
  for(var i in data) {
    processed += i+"\t"+JSON.stringify(data)+"\n";
  }
  callback && callback(processed);
  return parsed;
}

engine.prototype.parse = function(data, callback) {
  parsed = {};
  splitted = data.split("\n");
  for(var i in splitted) {
    spl = splitted[i].split("\t");
    parsed[spl[0]] = JSON.parse(spl[1]);
  }
  callback && callback(parsed);
  return parsed;
}

module.exports = engine;
