const { Transform } = require("stream");
const { src, dest, } = require("gulp");
const Vinyl = require("vinyl")

exports.default = function () {
    return src("./hello.txt").pipe(new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        transform(file, encoding, callback) {
            console.log(file)
            console.log(file.isBuffer())
            console.log(Vinyl.isVinyl(file));
            console.log(file.contents.toString())

            file.contents = Buffer.from("3");
            callback(null,file);
        }
    })).pipe(dest("build"))
}