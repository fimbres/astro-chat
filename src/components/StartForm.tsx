import { Show, createSignal } from "solid-js";

import { loginWithPass, registerWithPass } from "../backend/UserService";

export default function StartForm() {
    const [view, setView] = createSignal<"login" | "register">("login");
    const [name, setName] = createSignal("");
    const [mail, setMail] = createSignal("");
    const [pass, setPass] = createSignal("");
    const [err, setErr] = createSignal<null | string>(null);

    async function login(e: Event) {
        e.preventDefault();

        setErr(null);

        try {
            await loginWithPass(mail(), pass());
            window.location.href = "/chat";
        } catch (error: any) {
            if(error.response?.code === 400) {
                setErr("Failed to login.");
            }
        }
    }

    async function register(e: Event) {
        e.preventDefault();

        setErr(null);

        try {
            await registerWithPass(mail(), pass(), name());
            window.location.href = "/chat";
        } catch (error: any) {
            if(error.response?.code === 400) {
                setErr("Failed to register.");
                console.log(error.response)
            }
        }
    }

    function toggleView() {
        setErr(null);
        setView(view() === "login" ? "register" : "login");
    }

    return (
        <section class="h-screen flex items-center justify-center">
            <form class="w-[500px] flex flex-col">
                <Show when={view() === "register"}>
                    <input class="h-[54px] bg-[#F2F2F2] text-[17px] mb-[15px] px-[25px] py-0 rounded-lg border-0 outline-none" placeholder="Your name" type="text" value={name()} onChange={ev => setName(ev.target.value)} />
                </Show>

                <input class="h-[54px] bg-[#F2F2F2] text-[17px] mb-[15px] px-[25px] py-0 rounded-lg border-0 outline-none" placeholder="Your email" type="email" value={mail()} onChange={ev => setMail(ev.target.value)} />
                <input class="h-[54px] bg-[#F2F2F2] text-[17px] mb-[15px] px-[25px] py-0 rounded-lg border-0 outline-none" placeholder="Your password" type="password" value={pass()} onChange={ev => setPass(ev.target.value)} />

                <Show when={!!err()}>
                    <p class="text-[red] font-light m-0">{err()}</p>
                </Show>

                <footer class="flex items-center mt-[30px]">
                    <Show when={view() === "login"}>
                    <button class="text-blue-600 border-2 border-blue-600 rounded-md hover:bg-blue-600/20 transition px-4 py-1.5" onClick={login}>Login</button>
                    <p class="font-light ml-auto mr-0 my-0">New here? <a class="underline cursor-pointer" onClick={toggleView}>Register</a></p>
                    </Show>
                    
                    <Show when={view() === "register"}>
                    <button class="text-blue-600 border-2 border-blue-600 rounded-md hover:bg-blue-600/20 transition px-4 py-1.5" onClick={register}>Register</button>
                    <p class="font-light ml-auto mr-0 my-0">Already registered? <a class="underline cursor-pointer" onClick={toggleView}>Login</a></p>
                    </Show>
                </footer>
            </form>
        </section>
    );
}
