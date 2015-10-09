/**
 * Created by lijun on 15-5-29.
 */

var redis = require("redis");
function createClient() {
    var client = redis.createClient(CONFIG_REDIS.redis_port, CONFIG_REDIS.redis_host);
    client.auth(CONFIG_REDIS.redis_pass);
    return client;
}
var default_client = createClient();
global._Redis = default_client;
global._Redis_NEW = createClient();