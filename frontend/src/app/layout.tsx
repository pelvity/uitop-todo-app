import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Providers } from './providers';

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <Providers>{children}</Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
