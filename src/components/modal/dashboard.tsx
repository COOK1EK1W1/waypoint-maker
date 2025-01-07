export default async function DashboardModal({ userData }: { userData: any }) {
  //get projects from db

  await new Promise(r => setTimeout(r, 2000));

  let projects = [
    { name: "project1", length: 10 },
    { name: "project2", length: 20 },
    { name: "project3", length: 30 },
    { name: "project4", length: 40 },
    { name: "project5", length: 50 },
  ]

  return (<div>
    Signed in as {userData.user?.name}
    <div className="flex flex-wrap">
      {projects.map((project) => (
        <div className="border-2 border-slate-200 shadow-lg p-4 rounded-lg m-4">
          <p>{project.name}</p>
          <p>{project.length}</p>
        </div>

      ))}
    </div>
  </div>)
}
