const css = "width: 100px; border-top-color: oklch(0.5 0.1 200); background-color: rgb(13, 13, 13); color: oklab(0.5 0.1 200);";
console.log(css.replace(/([a-zA-Z-]+)\s*:[^;]*(?:oklch|oklab)[^;]*;/g, '$1: rgba(0,0,0,0);'));
