function load(component) {
    return resolve => require([`views/${component}`], resolve);
}

const routes = [
    {
        path: '/',
        name: 'player',
        component: load('player'),
        meta: {
            title: '播放器'
        }
    },
    {
        path: '*',
        redirect: {
            path: '/'
        }
    }
];
export default routes;
