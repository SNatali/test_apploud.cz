"use strict";



module.exports = function(grunt) {

    // 1. Вся настройка находится здесь
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),


  		less: {
    		development: {
        	options: {
            style: 'compressed'
     		},
        	files: {
            'css/style.css': 'less/style.less'
        }
    }
},

});

    // 3. Тут мы указываем Grunt, что хотим использовать этот плагин
    grunt.loadNpmTasks('grunt-contrib-less');
    //grunt.loadNpmTasks("grunt-postcss");
};

