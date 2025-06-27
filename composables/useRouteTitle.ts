export default (currentRoute: ComputedRef<string>) => {
  const appName = 'Mediguard'
  return { appName, currentRoute }
}
