let resize;

Split(['#canvas_container', '#rete_container'], {
    elementStyle: (dimension, size, gutterSize) => ({
        'flex-basis': `calc(${size}% - ${gutterSize}px)`,
    }),
    gutterStyle: (dimension, gutterSize) => ({
        'flex-basis':  `${gutterSize}px`,
    }),
    gutterSize: 5,
    onDragEnd: () => {
        if(resize) resize()
    }
})