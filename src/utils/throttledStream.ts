const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 把限速逻辑封装成“节流流”
export function throttledStream(
  rs: ReadableStream<Uint8Array>,
  interval: number,
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(ctrl) {
      const reader = rs.getReader();
      let last = performance.now();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 限速
        const now = performance.now();
        const elapsed = now - last;
        console.log("是否限速", elapsed < interval);
        if (elapsed < interval) await sleep(interval - elapsed);
        last = now;

        ctrl.enqueue(value); // 放行
      }
      ctrl.close();
    },
  });
}
