import webpack from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.config.base.mjs';

export default merge(baseConfig, {

    // Let webpack know this is a production build
    mode: 'production',

    // Turn off performance warnings until we have a plan for dealing with them
    performance: {
        hints: false
    },

    // Pass a variable through to our Web UI to tell it to not display stack traces
    plugins:[
        new webpack.DefinePlugin({
            IS_DEBUG: 'false',
        }),
    ]
});