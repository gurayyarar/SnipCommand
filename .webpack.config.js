module.exports = config => {
    config.target = 'electron-renderer';
    // config.module = {
    //     rules: [
    //         {
    //             test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
    //             loader: 'file-loader?name=assets/[name].[hash].[ext]'
    //         }
    //     ]
    // }
    return config;
}