import Smooch from "smooch";

window.init = async () => {
  try {
    await Smooch.init({
      integrationId: "65f4a281e2bab7777482db6d",
      embedded: true,
      soundNotificationEnabled: false,
    })

    console.log('Smooch: package init')
      const convo = await Smooch.createConversation({
        metadata: {
          "zen:ticket:tags": "yext-chat"
        }
      });
      console.log('Smooch: convo', convo)
      window.convoId = convo.id;
      Smooch.on((message, data) => {
        console.log('Smooch: message received', message, data)
      })
  } catch (error) {
    console.log('Smooch: package init failed', error)
  }

  const div = document.createElement('div');
  document.body.appendChild(div);
  div.style.display = 'none';
  Smooch.render(div);
}
window.sendMessage = async () => {
  console.log('Frontend: sending message')
  Smooch.sendMessage("Test!", window.convoId);
}