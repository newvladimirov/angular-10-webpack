const {resolve} = require('path');
const {AngularCompilerPlugin} = require('@ngtools/webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ContextReplacementPlugin = require('webpack').ContextReplacementPlugin;
const BuildOptimizerWebpackPlugin = require('@angular-devkit/build-optimizer').BuildOptimizerWebpackPlugin;
const buildOptimizerLoaderPath = require('@angular-devkit/build-optimizer').buildOptimizerLoaderPath;
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssWebpackPlugin = require('@angular-devkit/build-angular/src/angular-cli-files/plugins/optimize-css-webpack-plugin').OptimizeCssWebpackPlugin;

module.exports = (env = {}) => {
    const buildFolder = resolve('./custom-dist');

    return {
        mode: 'production',
        entry: ['./src/polyfills.ts', './src/main.ts'],
        resolve: {
            mainFields: ['es2015', 'browser', 'module', 'main'],
        },
        node: false,
        output: {
            path: resolve(__dirname, buildFolder),
        },
        plugins: [
            new ContextReplacementPlugin(/\@angular(\\|\/)core(\\|\/)/),
            new AngularCompilerPlugin({
                mainPath: resolve(__dirname, 'src/main.ts'),
                basePath: resolve(__dirname, 'src'),
                tsConfigPath: './tsconfig.app.json',
                contextElementDependencyConstructor: require('webpack/lib/dependencies/ContextElementDependency'),
                directTemplateLoading: true,
            }),
            new BuildOptimizerWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: resolve(__dirname, './src/index.html'),
            }),
        ],
        optimization: {
            minimizer: [
                new OptimizeCssWebpackPlugin({
                    sourceMap: false,
                    test: file => /\.(?:css|scss|sass|less|styl)$/.test(file),
                }),
                new TerserPlugin({
                    sourceMap: false,
                    parallel: 1,
                    cache: false,
                    extractComments: true,
                    terserOptions: {
                        warnings: false,
                        safari10: true,
                        output: {
                            ecma: 5,
                            ascii_only: true,
                            comments: false,
                            webkit: true,
                            beautify: false,
                        },
                        compress: {
                            ecma: 5,
                            pure_getters: true,
                            passes: 3,
                        },
                    }
                }),
            ]
        },
        module: {
            rules: [
                {
                    test: /[\/\\]@angular[\/\\]core[\/\\].+\.js$/,
                    parser: {system: true},
                },
                {
                    test: /[\/\\]rxjs[\/\\]add[\/\\].+\.js$/,
                    sideEffects: true,
                },
                {
                    test: /\.scss$/,
                    use: ['raw-loader', 'sass-loader'],
                },
                {
                    test: /\.css$/,
                    loader: 'raw-loader',
                },
                {
                    test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                    loader: '@ngtools/webpack',
                },
                {
                    test: /\.html$/,
                    loader: 'raw-loader',
                },
                {
                    test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.tsx?)$/,
                    loader: buildOptimizerLoaderPath,
                    options: {
                        sourceMap: false
                    }
                },
                {
                    test: /\.js$/,
                    loader: '@angular-devkit/build-optimizer/webpack-loader',
                    options: {
                        sourceMap: false
                    }
                }
            ]
        },
    };
};
