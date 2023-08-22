import { For, Show, createEffect, createSignal, onMount } from "solid-js";
import { findUser, isLink, isLogged, link, name } from "../backend/UserService";
import { Chat, Message, createChat, getChatName, getUserChats, updateChat } from "../backend/ChatService";
import { POCKET } from "../backend/PocketBase";

export default function ChatApp() {
  const [message, setMessage] = createSignal<string>("");
  const [chats, setChats] = createSignal<Chat[]>([]);
  const [active, setActive] = createSignal<Chat | null>(null);
  const [subId, setSubId] = createSignal<string>("");

  onMount(async () => {
    if (!isLogged()) {
      window.location.href = "/start";
      return;
    }
    setChats(await getUserChats(link()));
  });

  createEffect(() => {
    if (!active()) return;
    
    if (subId()) {
      POCKET.collection("chats").unsubscribe(subId());
    }
    setSubId(active()!.id);
    
    POCKET.collection("chats").subscribe<Chat>(subId(), ev => {
      setActive(ev.record);
    });
  });

  async function send() {
    if ((!active() || isLink(message())) && message() !== link()) {
      const user = await findUser(message());
      if (!!user) {
        const record = await createChat(link(), name(), user.link, user.name);
        setActive(record);
        setChats([...chats(), record]);
      }
    }
    
    if (!!active()) {
      const messages = [...active()!.messages, {
        message: message(),
        author: link(),
        created: new Date().getDate()
      }] as Message[];
      setActive({
        ...active()!,
        messages
      });
      updateChat(active()!.id, messages);
    }

    setMessage("");
  }

  function onKeyUp(ev: KeyboardEvent) {
    if (ev.key === "Enter") {
      send();
    }
  }

  return <section class="h-full flex items-center justify-center pt-12">
    <div class="w-[800px] flex h-screen box-border px-0 py-[30px]">
      <aside class="flex-1">
        <ul class="list-none m-0 p-0">
          <For each={chats()}>{(chat, i) =>
          <li class="mt-0 mb-[30px] mx-0">
            <button class="w-full uppercase font-bold cursor-pointer p-3 rounded-[10px] border-0" onClick={() => setActive(chat)}>
              {getChatName(chat, link())}
            </button>
          </li>
        }</For>
        </ul>
      </aside>

      <main class="flex-[9] relative">
        <ul class="absolute list-none m-0 px-[30px] py-0 top-0 bottom-[60px] inset-x-0">
          <Show when={!!active()} fallback="No messages yet.">
            <For each={active()?.messages}>{message =>
              <li class={message.author === link() ? "mb-[5px] text-right" : "mb-[5px]"}>
                <span class="text-white inline-block text-[15px] font-light px-[15px] py-1 rounded-[20px] bg-blue-600">{message.message}</span>
              </li>
            }</For>
          </Show>
        </ul>
        <footer class="absolute flex bottom-0 inset-x-0 pb-12">
          <input 
            class="w-full text-[17px] flex-[7.5] px-[30px] py-[15px] rounded-[100px] border-0 outline-none bg-[#e8e8e8]"
            placeholder={active() ? "You message..." : "Enter a user link"} 
            value={message()}
            onChange={ev => setMessage(ev.target.value)}
            onKeyUp={onKeyUp}
            />
          <button class="flex-1 w-[54px] ml-2.5 p-0 rounded-[50px] font-semibold text-blue-600 bg-[#e8e8e8] px-5" onClick={send}>
            Send
          </button>
        </footer>
      </main>
    </div>
  </section>
}
