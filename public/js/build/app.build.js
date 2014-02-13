({
    baseUrl: "js",

    appDir: "../../",

    dir: "../../../public-built",

    mainConfigFile: "../main.js",

    optimize: "none",

    modules: [

        { name: "main",
            excludeShallow: [],
            include: [
                'css', 'normalize','text',
            ]},
        { name: "routers/home.router", excludeShallow:['utils/cachemixin','libs/requirejs/plugins/text']}
    ]
})