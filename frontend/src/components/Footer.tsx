export function Footer() {
    return (
        <footer className="m-4">
            <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center">
                <p className="text-sm text-gray-500 text-center mb-2">
                Made by <a href="https://jairoreina.com" className="underline">Jairo Reina</a>
                </p>
            </div>
            <div className="flex items-center justify-center">
                <p className="text-sm text-gray-500">Find me on:</p>
                <p className="text-sm text-gray-500 mx-2">
                <a href="https://github.com/jairoreina" className="underline">GitHub</a>
                </p>
                <p className="text-sm text-gray-500 mx-2">
                <a href="https://www.x.com/jreina9" className="underline">X/Twitter</a>
                </p>
            </div>
            </div>
        </footer>
    );
}

export default Footer;