import React from 'react';
import Layout from '../common/Layout';
import Feed from './components/Feed';

const HomeScreen: React.FC<{children?: React.ReactNode}> = ({ children }) => {
  return(
    <Layout>
      {children ? children : <Feed />}
    </Layout>
  )
}

export default HomeScreen;