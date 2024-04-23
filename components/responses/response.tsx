interface Response {
  description: string
}

export function Response({ props: response }: { props: string }) {
  return (
    <div className="-mt-2 flex w-full flex-col gap-2 py-4">
      <div className="text-zinc-500">
        {response}
      </div>
    </div>
  )
}