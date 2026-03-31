const form = document.getElementById("userForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const userData = {
    name: document.getElementById("name").value,
    dob: document.getElementById("dob").value,
    time: document.getElementById("time").value,
    place: document.getElementById("place").value
  };

  console.log("Saving User Data:", userData);

  localStorage.setItem("astroUser", JSON.stringify(userData));

  const modal = new bootstrap.Modal(document.getElementById('successModal'));
  modal.show();
});

document.getElementById("goChat").onclick = () => {
  console.log("Redirecting to chat...");
  window.location.href = "chat.html";
};